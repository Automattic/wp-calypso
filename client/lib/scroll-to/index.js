const scrollers = new Map();

function getCurrentScroll( container ) {
	if ( container && container.scrollTop !== undefined ) {
		return {
			x: container.scrollLeft,
			y: container.scrollTop,
		};
	}

	const x = window.pageXOffset || document.documentElement.scrollLeft,
		y = window.pageYOffset || document.documentElement.scrollTop;
	return { x, y };
}

function makeScrollUpdater( container ) {
	container = container && container.scrollTop !== undefined ? container : window;

	return function updateScroll( x, y ) {
		if ( container === window ) {
			container.scrollTo( x, y );
		} else {
			container.scrollTop = y;
			container.scrollLeft = x;
		}
	};
}

class Stepper {
	constructor( options ) {
		this.x = options.x;
		this.y = options.y;
		this.startTime = null;
		this.duration = options.duration;
		this.start = options.start;
		this.end = options.end;
		this.onStart = options.onStart;
		this.onComplete = options.onComplete;
		this.updater = options.updater;
		this.easing = options.easing;
		this.container = options.container;
	}

	/**
	 * Schedule the next step in the animation
	 */
	animate() {
		this.nextFrame = requestAnimationFrame( this.step );
	}

	cancel() {
		if ( this.nextFrame ) {
			cancelAnimationFrame( this.nextFrame );
			this.nextFrame = null;
		}
		if ( this.finishTimeout ) {
			clearTimeout( this.finishTimeout );
			this.finishTimeout = null;
		}
	}

	/**
	 * Jump directly to a position, bypassing the stepper
	 *
	 * @param {number} x - x coord
	 * @param {number} y - y coord
	 */
	jumpTo( x, y ) {
		this.cancel();
		this.end = {
			x,
			y,
		};
		this.updater( x, y );
		this.finishTimeout = setTimeout( this.finish, this.duration );
	}

	finish = () => {
		this.updater( this.end.x, this.end.y );
		if ( this.onComplete ) {
			this.onComplete();
		}
		scrollers.delete( this.container );
	};

	/**
	 * Move a step along the timeline, with optional easing
	 *
	 * @param {number} ts - timestamp
	 */
	step = ( ts ) => {
		// reset the nextFrame raf handle so we can schedule another step
		this.nextFrame = null;

		// if this is the first time we've stepped, just mark this as the starting time and schedule another step
		if ( ! this.startTime ) {
			this.startTime = ts;
			this.animate();
			return;
		}

		// are we at or past our target duration?
		// go to the last coordinate and finish up
		if ( ts - this.startTime >= this.duration ) {
			this.finish();
			return;
		}

		// how far along are we? normalize this to a double in the range (0,1)
		const progress = ( ts - this.startTime ) / this.duration;

		// ease the progress. Easing can transform our progress outside of the 0,1 range, but it's still seen as a percentage
		const easedProgress = this.easing( progress );

		// figure out the new target values for this step.
		// Just multiply the eased progress by the total distance and add it to the starting point
		const newX = Math.round( this.start.x + ( this.end.x - this.start.x ) * easedProgress );
		const newY = Math.round( this.start.y + ( this.end.y - this.start.y ) * easedProgress );

		// There's a chance this step didn't actually change our values
		// (if we're stepping a short distance with a long duration for instance)
		// If there's no change, don't bother updating
		if ( newX !== this.x || newY !== this.y ) {
			this.x = newX;
			this.y = newY;
			this.updater( newX, newY );
		}

		// schedule the next step
		this.animate();
	};
}

/**
 * Eases the progress of a curve from 0 to 1. Slows down as it approaches the target.
 *
 * @param {number} val current value to be eased. [0,1]
 * @returns {number} eased val
 */
function circularOutEasing( val ) {
	const inverse = val - 1;
	return Math.sqrt( 1 - inverse * inverse );
}

/**
 * Scrolls a container to the specified location
 *
 * @param {object} options - options object (see below)
 * @param {number} options.x - desired left or x coordinate
 * @param {number} options.y - desired top or y coordinate
 * @param {Function} options.easing - easing function, defaults to TWEEN.Easing.Circular.Out
 * @param {number} options.duration - duration in ms, default 500
 * @param {Function} options.onStart - callback before start is called
 * @param {Function} options.onComplete - callback when scroll is finished
 * @param {HTMLElement} options.container - the container to scroll instead of window, if any
 * @returns {object} - the stepper
 */
export default function scrollTo( options ) {
	const container = options.container || window;

	if ( scrollers.has( container ) ) {
		const scroller = scrollers.get( container );
		scroller.jumpTo( options.x, options.y );

		return;
	}

	const currentScroll = getCurrentScroll( container );

	const stepper = new Stepper( {
		start: currentScroll,
		end: {
			x: options.x,
			y: options.y,
		},
		container,
		easing: options.easing || circularOutEasing,
		duration: options.duration || 500,
		updater: makeScrollUpdater( container ),
		x: currentScroll.x,
		y: currentScroll.y,
		onStart: options.onStart,
		onComplete: options.onComplete,
	} );
	scrollers.set( container, stepper );
	stepper.animate();
	if ( options.onStart ) {
		options.onStart();
	}
	return stepper;
}
