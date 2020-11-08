import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { Controller } from 'stimulus'
import { tabbable } from 'tabbable'

export default class extends Controller {
  get noTransition() {
    const computedStyle = getComputedStyle(this.element)

    return (
      computedStyle.transitionDuration === '0s' &&
      computedStyle.transitionDelay === '0s'
    )
  }

  initialize() {
    this.inertRoots = this.data.has('inertRoots')
      ? [...document.querySelectorAll(this.data.get('inertRoots'))]
      : [...this.element.parentElement.children].filter(
          (el) => el !== this.element
        )

    this.handleOpenerClick = this.handleOpenerClick.bind(this)

    this.openers = document.querySelectorAll(
      `[data-dialog-show="${this.element.id}"]`
    )
    this.openers.forEach((el) => {
      el.addEventListener('click', this.handleOpenerClick)
    })

    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this)

    this.originalAriaHiddenValues = new WeakMap()

    this.originalTabIndexes = new WeakMap()

    this.isOpen = this.element.getAttribute('aria-hidden') !== 'true'

    if (this.isOpen) this.show()
  }

  show() {
    if (this.isOpen) return

    this.isOpen = true

    this.element.removeAttribute('aria-hidden')

    this.disableInertRoots()

    this.disableInertRootsDescendants()

    disableBodyScroll(this.element, {
      reserveScrollBarGap: true,
    })

    this.focusFirstTabbableDescendant()

    this.element.scrollTop = 0

    document.addEventListener('keydown', this.handleKeyDown)

    if (this.noTransition) {
      this.cleanUp()
    } else {
      this.element.addEventListener('transitionend', this.handleTransitionEnd)
    }

    this.emit('show')
  }

  disableInertRoots() {
    this.inertRoots.forEach((el) => {
      this.originalAriaHiddenValues.set(el, el.getAttribute('aria-hidden'))

      el.setAttribute('aria-hidden', 'true')
    })
  }

  disableInertRootsDescendants() {
    this.tabbableInertDescendants = this.inertRoots.flatMap((el) =>
      tabbable(el)
    )
    this.tabbableInertDescendants.forEach((el) => {
      this.originalTabIndexes.set(el, el.getAttribute('tabindex'))

      el.setAttribute('tabindex', '-1')
    })
  }

  focusFirstTabbableDescendant() {
    this.previousActiveEl = document.activeElement

    const autoFocusDescendant = this.element.querySelector('[autofocus]')

    if (autoFocusDescendant) {
      autoFocusDescendant.focus()
    } else {
      const tabbableDialogDescendants = tabbable(this.element)

      if (tabbableDialogDescendants.length) {
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

    this.enableInertRoots()

    this.enableInertRootsDescendants()

    enableBodyScroll(this.element)

    this.previousActiveEl.focus()

    document.removeEventListener('keydown', this.handleKeyDown)

    if (this.noTransition) {
      this.cleanUp()
    } else {
      this.element.addEventListener('transitionend', this.handleTransitionEnd)
    }

    this.emit('hide')
  }

  enableInertRoots() {
    this.inertRoots.forEach((el) => {
      const originalAriaHiddenValue = this.originalAriaHiddenValues.get(el)

      if (originalAriaHiddenValue) {
        el.setAttribute('aria-hidden', originalAriaHiddenValue)
      } else {
        el.removeAttribute('aria-hidden')
      }
    })
  }

  enableInertRootsDescendants() {
    this.tabbableInertDescendants.forEach((el) => {
      const originalTabIndex = this.originalTabIndexes.get(el)

      if (originalTabIndex) {
        el.setAttribute('tabindex', originalTabIndex)
      } else {
        el.removeAttribute('tabindex')
      }

      this.originalTabIndexes.delete(el)
    })
  }

  cleanUp() {
    if (!this.noTransition) {
      this.element.removeEventListener(
        'transitionend',
        this.handleTransitionEnd
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
    if (e.key === 'Escape' || e.key === 'Esc') this.hide()
  }

  handleTransitionEnd(e) {
    if (e && e.target !== this.element) return

    this.cleanUp()
  }
}
