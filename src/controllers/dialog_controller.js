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
    this.appRoot = document.getElementById(this.data.get('app-root'))

    this.handleOpenerClick = this.handleOpenerClick.bind(this)

    this.openers = document.querySelectorAll(
      `[data-dialog-show="${this.element.id}"]`
    )
    this.openers.forEach((el) => {
      el.addEventListener('click', this.handleOpenerClick)
    })

    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.handleTransitionEnd = this.handleTransitionEnd.bind(this)

    this.previousTabIndexes = new WeakMap()

    this.isOpen = this.element.getAttribute('aria-hidden') !== 'true'

    if (this.isOpen) this.show()
  }

  show() {
    if (this.isOpen) return

    this.element.removeAttribute('aria-hidden')

    this.appRoot.setAttribute('aria-hidden', 'true')

    window.addEventListener('keydown', this.handleKeyDown)

    this.disableTabbableAppRootDescendants()

    this.focusFirstTabbableDescendant()

    disableBodyScroll(this.element, {
      reserveScrollBarGap: true,
    })

    this.element.scrollTop = 0

    this.isOpen = true

    this.emit('show')

    if (this.noTransition) {
      this.cleanUp()
    } else {
      this.element.addEventListener('transitionend', this.handleTransitionEnd)
    }
  }

  disableTabbableAppRootDescendants() {
    this.tabbableAppRootDescendants = tabbable(this.appRoot)
    this.tabbableAppRootDescendants.forEach((el) => {
      this.previousTabIndexes.set(el, el.getAttribute('tabindex'))

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

    this.element.setAttribute('aria-hidden', 'true')

    this.appRoot.removeAttribute('aria-hidden')

    window.removeEventListener('keydown', this.handleKeyDown)

    this.restoreTabbableAppRootDescendants()

    this.restoreFocus()

    enableBodyScroll(this.element)

    this.isOpen = false

    this.emit('hide')

    if (this.noTransition) {
      this.cleanUp()
    } else {
      this.element.addEventListener('transitionend', this.handleTransitionEnd)
    }
  }

  restoreTabbableAppRootDescendants() {
    this.tabbableAppRootDescendants.forEach((el) => {
      const previousTabIndex = this.previousTabIndexes.get(el)

      if (previousTabIndex) {
        el.setAttribute('tabindex', previousTabIndex)
      } else {
        el.removeAttribute('tabindex')
      }

      this.previousTabIndexes.delete(el)
    })
  }

  restoreFocus() {
    this.previousActiveEl.focus()
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
