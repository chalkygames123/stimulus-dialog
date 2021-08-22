import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { Controller } from 'stimulus'
import { tabbable, isFocusable } from 'tabbable'

export default class extends Controller {
	static values = {
		inertRoots: String,
	}

	isOpen = false

	openers = document.querySelectorAll(`[data-dialog-show="${this.element.id}"]`)

	inertRoots = this.hasInertRootsValue
		? [...document.querySelectorAll(this.inertRootsValue)]
		: [...this.element.parentElement.children].filter(
				(el) => el !== this.element
		  )

	tabbableInertDescendants = []

	originalTabIndexes = new WeakMap()

	previousActiveEl = undefined

	handleOpenerClick = this.handleOpenerClick.bind(this)

	handleKeyDown = this.handleKeyDown.bind(this)

	handleElementTransitionEnd = this.handleElementTransitionEnd.bind(this)

	get noTransition() {
		const computedStyle = getComputedStyle(this.element)

		return (
			(computedStyle.transitionDuration === '0s' &&
				computedStyle.transitionDelay === '0s') ||
			computedStyle.length === 0
		)
	}

	connect() {
		this.element.setAttribute('aria-hidden', 'true')
		this.element.setAttribute('aria-modal', 'true')

		if (!this.element.hasAttribute('role')) {
			this.element.setAttribute('role', 'dialog')
		}

		for (const el of this.openers) {
			el.addEventListener('click', this.handleOpenerClick)
		}
	}

	disconnect() {
		for (const el of this.openers) {
			el.removeEventListener('click', this.handleOpenerClick)
		}

		if (this.isOpen) this.hide()
	}

	show() {
		if (this.isOpen) return

		this.isOpen = true

		this.element.removeAttribute('aria-hidden')

		this.disableInertRootsDescendants()

		disableBodyScroll(this.element, {
			reserveScrollBarGap: true,
		})

		this.element.scrollTop = 0

		this.focusFirstTabbableDescendant()

		document.addEventListener('keydown', this.handleKeyDown)

		if (this.noTransition) {
			this.cleanUp()
		} else {
			this.element.addEventListener(
				'transitionend',
				this.handleElementTransitionEnd
			)
		}

		this.emit('show')
	}

	disableInertRootsDescendants() {
		this.tabbableInertDescendants = this.inertRoots.flatMap((el) =>
			tabbable(el)
		)

		for (const el of this.tabbableInertDescendants) {
			this.originalTabIndexes.set(el, el.getAttribute('tabindex'))

			el.setAttribute('tabindex', '-1')
		}
	}

	focusFirstTabbableDescendant() {
		this.previousActiveEl = document.activeElement

		const autoFocusDescendant = this.element.querySelector('[autofocus]')

		if (autoFocusDescendant && isFocusable(autoFocusDescendant)) {
			autoFocusDescendant.focus()
		} else {
			const tabbableDialogDescendants = tabbable(this.element)

			if (tabbableDialogDescendants.length > 0) {
				tabbableDialogDescendants[0].focus()
			} else {
				this.element.focus()
			}
		}
	}

	hide() {
		if (!this.isOpen) return

		this.isOpen = false

		this.element.setAttribute('aria-hidden', 'true')

		this.enableInertRootsDescendants()

		enableBodyScroll(this.element)

		this.previousActiveEl.focus()

		document.removeEventListener('keydown', this.handleKeyDown)

		if (this.noTransition) {
			this.cleanUp()
		} else {
			this.element.addEventListener(
				'transitionend',
				this.handleElementTransitionEnd
			)
		}

		this.emit('hide')
	}

	enableInertRootsDescendants() {
		for (const el of this.tabbableInertDescendants) {
			const originalTabIndex = this.originalTabIndexes.get(el)

			if (originalTabIndex) {
				el.setAttribute('tabindex', originalTabIndex)
			} else {
				el.removeAttribute('tabindex')
			}

			this.originalTabIndexes.delete(el)
		}
	}

	cleanUp() {
		if (!this.noTransition) {
			this.element.removeEventListener(
				'transitionend',
				this.handleElementTransitionEnd
			)
		}

		if (this.isOpen) {
			this.emit('shown')
		} else {
			this.emit('hidden')
		}
	}

	emit(type) {
		this.element.dispatchEvent(
			new CustomEvent(type, {
				bubbles: true,
			})
		)
	}

	handleOpenerClick() {
		this.show()
	}

	handleKeyDown(e) {
		if (
			(e.key === 'Escape' || e.key === 'Esc') &&
			this.element.getAttribute('role') !== 'alertdialog'
		) {
			this.hide()
		}
	}

	handleElementTransitionEnd(e) {
		if (e.target !== this.element) return

		this.cleanUp()
	}
}
