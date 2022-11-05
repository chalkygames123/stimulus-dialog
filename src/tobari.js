// TODO: ツールバーが隠されているとき overscroll-behavior が効かないのを修正する

const savedScrollPosition = 0;
const isScrollbarGutterSupported = CSS.supports('scrollbar-gutter: initial');
const isClient = typeof window !== 'undefined';

console.log({ isScrollbarGutterSupported });

export function drop() {
	if (!isClient) return;

	// savedScrollPosition = window.pageYOffset;

	// document.scrollingElement.style.setProperty("overflow", "hidden");
	// document.scrollingElement.style.setProperty("position", "fixed");
	// document.scrollingElement.style.setProperty(
	//   "top",
	//   `-${savedScrollPosition}px`
	// );
	// document.scrollingElement.style.setProperty("width", "100%");
	document.scrollingElement.style.setProperty('overflow', 'clip');
	document.scrollingElement.style.setProperty('overscroll-behavior', 'contain');
}

export function raise() {
	// if (!isClient) return;

	// document.scrollingElement.style.removeProperty("overflow");
	// document.scrollingElement.style.removeProperty("position");
	// document.scrollingElement.style.removeProperty("top");
	// document.scrollingElement.style.removeProperty("width");

	// // TODO: あらかじめ scroll-behavior: smooth; を一時的に無効にする
	// window.scrollTo(0, savedScrollPosition);
	document.scrollingElement.style.removeProperty('overflow');
	document.scrollingElement.style.removeProperty('overscroll-behavior');
}
