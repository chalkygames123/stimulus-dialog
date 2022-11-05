import { Controller } from '@hotwired/stimulus';
import { tabbable } from 'tabbable';
import { drop, raise } from '../tobari.js';

export default class Dialog extends Controller {
	static values = {
		inertRoots: String,
	};

	isOpen = false;

	openers = document.querySelectorAll(
		`[data-dialog-show="${this.element.id}"]`,
	);

	inertRoots = this.hasInertRootsValue
		? [...document.querySelectorAll(this.inertRootsValue)]
		: [...this.element.parentElement.children].filter(
				(el) => el !== this.element,
		  );

	tabbableInertDescendants = [];

	originalTabIndices = new WeakMap();

	previousActiveEl = undefined;

	get noTransition() {
		const computedStyle = getComputedStyle(this.element);
		const durations = computedStyle.transitionDuration.split(', ');
		const delays = computedStyle.transitionDelay.split(', ');

		return (
			durations.every((el) => el === '0s') && delays.every((el) => el === '0s')
		);
	}

	connect() {
		this.element.setAttribute('aria-hidden', 'true');
		this.element.setAttribute('aria-modal', 'true');
		this.element.setAttribute('tabindex', '-1');

		if (!this.element.hasAttribute('role')) {
			this.element.setAttribute('role', 'dialog');
		}

		for (const el of this.openers) {
			el.addEventListener('click', this.handleOpenerClick);
		}
	}

	disconnect() {
		for (const el of this.openers) {
			el.removeEventListener('click', this.handleOpenerClick);
		}

		if (this.isOpen) this.hide();
	}

	show() {
		if (this.isOpen) return;

		this.isOpen = true;

		this.element.removeAttribute('aria-hidden');

		this.disableInertRootsDescendants();

		drop();

		// disableBodyScroll(this.element, {
		// 	reserveScrollBarGap: true,
		// });

		this.element.scrollTop = 0;

		this.focusDialog();

		document.addEventListener('keydown', this.handleKeyDown);

		if (this.noTransition) {
			this.cleanUp();
		} else {
			this.element.addEventListener(
				'transitionend',
				this.handleElementTransitionEnd,
			);
		}

		this.dispatch('show');
	}

	disableInertRootsDescendants() {
		this.tabbableInertDescendants = this.inertRoots.flatMap((el) =>
			tabbable(el),
		);

		for (const el of this.tabbableInertDescendants) {
			this.originalTabIndices.set(el, el.getAttribute('tabindex'));

			el.setAttribute('tabindex', '-1');
		}
	}

	focusDialog() {
		this.previousActiveEl = document.activeElement;

		(this.element.querySelector('[autofocus]') || this.element).focus();
	}

	hide() {
		if (!this.isOpen) return;

		this.isOpen = false;

		this.element.setAttribute('aria-hidden', 'true');

		this.enableInertRootsDescendants();

		raise();

		// enableBodyScroll(this.element);

		this.previousActiveEl.focus();

		document.removeEventListener('keydown', this.handleKeyDown);

		if (this.noTransition) {
			this.cleanUp();
		} else {
			this.element.addEventListener(
				'transitionend',
				this.handleElementTransitionEnd,
			);
		}

		this.dispatch('hide');
	}

	enableInertRootsDescendants() {
		for (const el of this.tabbableInertDescendants) {
			const originalTabIndex = this.originalTabIndices.get(el);

			if (originalTabIndex) {
				el.setAttribute('tabindex', originalTabIndex);
			} else {
				el.removeAttribute('tabindex');
			}

			this.originalTabIndices.delete(el);
		}
	}

	cleanUp() {
		if (!this.noTransition) {
			this.element.removeEventListener(
				'transitionend',
				this.handleElementTransitionEnd,
			);
		}

		if (this.isOpen) {
			this.dispatch('shown');
		} else {
			this.dispatch('hidden');
		}
	}

	handleOpenerClick = () => {
		this.show();
	};

	handleKeyDown = (e) => {
		if (e.isComposing) return;

		if (
			(e.key === 'Escape' || e.key === 'Esc') &&
			this.element.getAttribute('role') !== 'alertdialog'
		) {
			this.hide();
		}
	};

	handleElementTransitionEnd = (e) => {
		if (e.target !== this.element) return;

		this.cleanUp();
	};
}
