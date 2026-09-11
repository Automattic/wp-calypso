// Base UI, which backs `@wordpress/ui`'s overlays, drives its triggers from pointer
// events and measures elements on open. jsdom implements none of that, so without
// these a menu never opens and the tests see only a collapsed trigger.

if ( typeof window.PointerEvent === 'undefined' ) {
	window.PointerEvent = class PointerEvent extends MouseEvent {
		constructor( type, props = {} ) {
			super( type, props );
			this.pointerId = props.pointerId ?? 1;
			this.pointerType = props.pointerType ?? 'mouse';
			this.width = props.width ?? 1;
			this.height = props.height ?? 1;
			this.isPrimary = props.isPrimary ?? true;
		}
	};
}

Object.assign( window.Element.prototype, {
	hasPointerCapture: () => false,
	setPointerCapture: () => {},
	releasePointerCapture: () => {},
	scrollIntoView: () => {},
	checkVisibility: () => true,
	getAnimations: () => [],
} );
