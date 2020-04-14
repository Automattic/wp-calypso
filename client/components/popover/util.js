/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:popover:util' );

// inspired by https://github.com/jkroso/viewport
function updateViewport() {
	const viewport = {};
	viewport.top = window.scrollY;
	viewport.left = window.scrollX;
	viewport.width = window.innerWidth;
	viewport.height = window.innerHeight;
	viewport.right = viewport.left + viewport.width;
	viewport.bottom = viewport.top + viewport.height;

	debug( 'viewport: %o', viewport );
	return viewport;
}

const opposite = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

const adjacent = {
	top: 'right',
	left: 'top',
	bottom: 'left',
	right: 'bottom',
};

let _viewport = null;
let _windowEventsRefCount = 0;

function getViewport() {
	if ( ! _viewport ) {
		// initialize on first use
		_viewport = updateViewport();
	}

	return _viewport;
}

function onViewportChange() {
	_viewport = updateViewport();
}

export function bindWindowListeners() {
	if ( _windowEventsRefCount++ > 0 ) {
		return;
	}

	debug( 'bind handlers to `resize` and `scroll` events' );
	// don't debounce these because they don't so any work that requires layout
	window.addEventListener( 'resize', onViewportChange, true );
	window.addEventListener( 'scroll', onViewportChange, true );
}

export function unbindWindowListeners() {
	if ( --_windowEventsRefCount > 0 ) {
		return;
	}

	debug( 'unbind handlers to `resize` and `scroll` events' );
	window.removeEventListener( 'resize', onViewportChange, true );
	window.removeEventListener( 'scroll', onViewportChange, true );
}

export function suggested( pos, el, target ) {
	const viewport = getViewport();
	const targetPosition = target.getBoundingClientRect();
	const h = el.clientHeight;
	const w = el.clientWidth;

	// see where we have spare room
	const room = {
		top: targetPosition.top - h,
		bottom: viewport.height - targetPosition.bottom - h,
		left: targetPosition.left - w,
		right: viewport.width - targetPosition.right - w,
	};

	const arrayPositions = pos.split( /\s+/ );
	const [ pos0 ] = arrayPositions;
	let [ , pos1 ] = arrayPositions;

	const primary = choosePrimary( pos0, room );

	if ( pos1 === primary || pos1 === opposite[ primary ] ) {
		pos1 = null;
	}

	return chooseSecondary( primary, pos1, el, target, w, h ) || pos;
}

function choosePrimary( prefered, room ) {
	// top, bottom, left, right in order of preference
	const order = [
		prefered,
		opposite[ prefered ],
		adjacent[ prefered ],
		opposite[ adjacent[ prefered ] ],
	];

	let best = -Infinity;
	let bestPos;

	for ( let i = 0, len = order.length; i < len; i++ ) {
		const _prefered = order[ i ];
		const space = room[ _prefered ];
		// the first side it fits completely
		if ( space > 0 ) {
			return _prefered;
		}

		// less chopped of than other sides
		if ( space > best ) {
			( best = space ), ( bestPos = prefered );
		}
	}

	return bestPos;
}

function chooseSecondary( primary, prefered, el, target, w, h ) {
	const viewport = getViewport();
	// top, top left, top right in order of preference
	const isVertical = primary === 'top' || primary === 'bottom';

	const order = prefered
		? [
				isVertical ? `${ primary } ${ prefered }` : `${ prefered } ${ primary }`,
				primary,
				isVertical
					? `${ primary } ${ opposite[ prefered ] }`
					: `${ opposite[ prefered ] } ${ primary }`,
		  ]
		: [
				primary,
				isVertical
					? `${ primary } ${ adjacent[ primary ] }`
					: `${ adjacent[ primary ] } ${ primary }`,
				isVertical
					? `${ primary } ${ opposite[ adjacent[ primary ] ]}`
					: `${ opposite[ adjacent[ primary ] ]} ${ primary }`,
		  ];

	let bestPos;
	let best = 0;
	const max = w * h;

	for ( let i = 0, len = order.length; i < len; i++ ) {
		const pos = order[ i ];
		const off = offset( pos, el, target );
		const offRight = off.left + w;
		const offBottom = off.top + h;
		const yVisible = Math.min(
			off.top < viewport.top ? offBottom - viewport.top : viewport.bottom - off.top,
			h
		);

		const xVisible = Math.min(
			off.left < viewport.left ? offRight - viewport.left : viewport.right - off.left,
			w
		);

		const area = xVisible * yVisible;

		// the first position that shows all the tip
		if ( area === max ) {
			return pos;
		}

		// shows more of the tip than the other positions
		if ( area > best ) {
			( best = area ), ( bestPos = pos );
		}
	}

	return bestPos;
}

export function offset( pos, el, target, relativePosition ) {
	const pad = 15;
	const tipRect = el.getBoundingClientRect();

	if ( ! tipRect ) {
		throw new Error( 'could not get bounding client rect of Tip element' );
	}

	const ew = tipRect.width;
	const eh = tipRect.height;
	const targetRect = target.getBoundingClientRect();

	if ( ! targetRect ) {
		throw new Error( 'could not get bounding client rect of `target`' );
	}

	const tw = targetRect.width;
	const th = targetRect.height;
	const to = _offset( targetRect, document );

	if ( ! to ) {
		throw new Error( 'could not determine page offset of `target`' );
	}

	let _pos = {};

	switch ( pos ) {
		case 'top':
			_pos = {
				top: to.top - eh,
				left:
					relativePosition && relativePosition.left
						? to.left + relativePosition.left
						: to.left + tw / 2 - ew / 2,
			};
			break;

		case 'bottom':
			_pos = {
				top: to.top + th,
				left:
					relativePosition && relativePosition.left
						? to.left + relativePosition.left
						: to.left + tw / 2 - ew / 2,
			};
			break;

		case 'right':
			_pos = {
				top: to.top + th / 2 - eh / 2,
				left: to.left + tw,
			};
			break;

		case 'left':
			_pos = {
				top: to.top + th / 2 - eh / 2,
				left: to.left - ew,
			};
			break;

		case 'top left':
			_pos = {
				top: to.top - eh,
				left: to.left + tw / 2 - ew + pad,
			};
			break;

		case 'top right':
			_pos = {
				top: to.top - eh,
				left: to.left + tw / 2 - pad,
			};
			break;

		case 'bottom left':
			_pos = {
				top: to.top + th,
				left: to.left + tw / 2 - ew + pad,
			};
			break;

		case 'bottom right':
			_pos = {
				top: to.top + th,
				left: to.left + tw / 2 - pad,
			};
			break;

		case 'left top':
			_pos = {
				top: to.top + th / 2 - eh,
				left: to.left - ew,
			};
			break;

		case 'left bottom':
			_pos = {
				top: to.top + th / 2,
				left: to.left - ew,
			};
			break;

		case 'right top':
			_pos = {
				top: to.top + th / 2 - eh,
				left: to.left + tw,
			};
			break;

		case 'right bottom':
			_pos = {
				top: to.top + th / 2,
				left: to.left + tw,
			};
			break;

		default:
			throw new Error( `invalid position "${ pos }"` );
	}

	return _pos;
}

/**
 * Extracted from `timoxley/offset`, but directly using a
 * TextRectangle instead of getting another version.
 *
 * @param {window.TextRectangle} box - result from a `getBoundingClientRect()` call
 * @param {window.Document} doc - Document instance to use
 * @returns {object} an object with `top` and `left` Number properties
 * @private
 */
function _offset( box, doc ) {
	const body = doc.body || doc.getElementsByTagName( 'body' )[ 0 ];
	const docEl = doc.documentElement || body.parentNode;
	const clientTop = docEl.clientTop || body.clientTop || 0;
	const clientLeft = docEl.clientLeft || body.clientLeft || 0;
	const scrollTop = window.pageYOffset || docEl.scrollTop;
	const scrollLeft = window.pageXOffset || docEl.scrollLeft;

	return {
		top: box.top + scrollTop - clientTop,
		left: box.left + scrollLeft - clientLeft,
	};
}

/**
 * Constrain a left to keep the element in the window
 *
 * @param {object} off Proposed offset before constraining
 * @param {window.Element} el Element to be constained to viewport
 * @returns {number}    the best width
 */
export function constrainLeft( off, el ) {
	const viewport = getViewport();
	const ew = el.getBoundingClientRect().width;
	off.left = Math.max( 0, Math.min( off.left, viewport.width - ew ) );

	return off;
}
