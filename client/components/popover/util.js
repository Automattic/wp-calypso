/**
 * External dependencies
 */
import getBoundingClientRect from 'bounding-client-rect';
import debugFactory from 'debug';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:popover:util' );

// inspired by https://github.com/jkroso/viewport
function updateViewport( v = {} ) {
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

function onViewportChange() {
  viewport = updateViewport();
}

let viewport = updateViewport();

export const suggested = ( pos, el, target ) => {
	var targetPosition = getBoundingClientRect( target );
	var h = el.clientHeight;
	var w = el.clientWidth;

	// see where we have spare room
	var room = {
		top: targetPosition.top - h,
		bottom: viewport.height - targetPosition.bottom - h,
		left: targetPosition.left - w,
		right: viewport.width - targetPosition.right - w
	};

	var positions = pos.split(/\s+/);
	var primary = choosePrimary( positions[ 0 ], room );
	if( positions[ 1 ] === primary || positions[ 1 ] === opposite[primary] ) {
		positions[ 1 ] = null;
	}

	return chooseSecondary(primary, positions[ 1 ], el, target, w, h) || pos;
};

function choosePrimary(prefered, room){
	// top, bottom, left, right in order of preference
	var order = [
		prefered,
		opposite[ prefered ],
		adjacent[ prefered ],
		opposite[ adjacent[ prefered ] ] 
	];

	var best = -Infinity;
	var bestPos;
	for (var i = 0, len = order.length; i < len; i++) {
		var prefered = order[i];
		var space = room[prefered];
		// the first side it fits completely
		if (space > 0) return prefered;
		// less chopped of than other sides
		if (space > best) best = space, bestPos = prefered;
	}
	return bestPos;
}

function chooseSecondary( primary, prefered, el, target, w, h ){
	// top, top left, top right in order of preference
	var order = prefered
		? [primary + ' ' + prefered, primary, primary + ' ' + opposite[prefered]]
		: [primary, primary + ' ' + adjacent[primary], primary + ' ' + opposite[adjacent[primary]]];
	var bestPos;
	var best = 0;
	var max = w * h;
	for (var i = 0, len = order.length; i < len; i++) {
		var pos = order[i];
		var off = offset(pos, el, target);
		var offRight = off.left + w;
		var offBottom = off.top + h;
		var yVisible = Math.min(off.top < viewport.top ? offBottom - viewport.top : viewport.bottom - off.top, h);
		var xVisible = Math.min(off.left < viewport.left ? offRight - viewport.left : viewport.right - off.left, w);
		var area = xVisible * yVisible;
		// the first position that shows all the tip
		if (area == max) return pos;
		// shows more of the tip than the other positions
		if (area > best) best = area, bestPos = pos;
	}
	return bestPos;
}

export function offset ( pos, el, target ) {
	const pad = 30;
	const tipRect = getBoundingClientRect( el );

	if ( ! tipRect ) {
		throw new Error( 'could not get bounding client rect of Tip element' );
	}

	var ew = tipRect.width;
	var eh = tipRect.height;

	var targetRect = getBoundingClientRect( target );
	if ( ! targetRect ) {
		throw new Error( 'could not get bounding client rect of `target`' );
	}

	var tw = targetRect.width;
	var th = targetRect.height;

  var to = _offset( targetRect, document );
  if ( ! to ) {
	throw new Error( 'could not determine page offset of `target`' );
  }

  var pos;

  switch (pos) {
	case 'top':
	  pos = {
		top: to.top - eh,
		left: to.left + tw / 2 - ew / 2
	  };
	  break;
	case 'bottom':
	  pos = {
		top: to.top + th,
		left: to.left + tw / 2 - ew / 2
	  };
	  break;
	case 'right':
	  pos = {
		top: to.top + th / 2 - eh / 2,
		left: to.left + tw
	  };
	  break;
	case 'left':
	  pos = {
		top: to.top + th / 2 - eh / 2,
		left: to.left - ew
	  };
	  break;
	case 'top left':
	  pos = {
		top: to.top - eh,
		left: to.left + tw / 2 - ew + pad
	  };
	  break;
	case 'top right':
	  pos = {
		top: to.top - eh,
		left: to.left + tw / 2 - pad
	  };
	  break;
	case 'bottom left':
	  pos = {
		top: to.top + th,
		left: to.left + tw / 2 - ew + pad
	  };
	  break;
	case 'bottom right':
	  pos = {
		top: to.top + th,
		left: to.left + tw / 2 - pad
	  };
	  break;
	case 'left top':
	  pos = {
		top: to.top + th / 2 - eh,
		left: to.left - ew
	  };
	  break;
	case 'left bottom':
	  pos = {
		top: to.top + th / 2,
		left: to.left - ew
	  };
	  break;
	case 'right top':
		pos = {
			top: to.top + th / 2 - eh,
			left: to.left + tw
		};
		break;
	case 'right bottom':
	  pos = {
		top: to.top + th / 2,
		left: to.left + tw
	  };
	  break;
	default:
	  throw new Error( 'invalid position "' + pos + '"' );
  }
  return pos;
};

/**
 * Extracted from `timoxley/offset`, but directly using a
 * TextRectangle instead of getting another version.
 *
 * @param {TextRectangle} box - result from a `getBoundingClientRect()` call
 * @param {Document} doc - Document instance to use
 * @return {Object} an object with `top` and `left` Number properties
 * @api private
 */

function _offset( box, doc ) {
  var body = doc.body || doc.getElementsByTagName( 'body' )[ 0 ];
  var docEl = doc.documentElement || body.parentNode;
  var clientTop  = docEl.clientTop  || body.clientTop  || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  var scrollTop  = window.pageYOffset || docEl.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft;

  return {
	top: box.top  + scrollTop  - clientTop,
	left: box.left + scrollLeft - clientLeft
  };
};

var opposite = {
	top: 'bottom', bottom: 'top',
	left: 'right', right: 'left'
};

var adjacent = {
	top: 'right',
	left: 'top',
	bottom: 'left',
	right: 'bottom'
};

/**
 * Constrain a left to keep the element in the window
 * @param  {Object} pl proposed left
 * @param  {Number} ew tip element width
 * @return {Number}    the best width
 */
export const constrainLeft = function( off, el ) {
  var ew = getBoundingClientRect(el).width;
  off.left = Math.max( 0, Math.min( off.left, viewport.width - ew ) );
  return off;
}
