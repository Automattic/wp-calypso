/** @format */

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

	step = ts => {
		this.nextFrame = null;
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

		// how far along are we as a percentage?
		const progress = ( ts - this.startTime ) / this.duration;

		// ease the progress
		const easedProgress = this.easing( progress );

		// figure out the new values
		const newX = Math.round( this.start.x + ( this.end.x - this.start.x ) * easedProgress );
		const newY = Math.round( this.start.y + ( this.end.y - this.start.y ) * easedProgress );

		if ( newX !== this.x || newY !== this.y ) {
			this.x = newX;
			this.y = newY;
			this.updater( newX, newY );
		}

		// set up the next turn
		this.animate();
	};
}

function circularInOutEasing( val ) {
	if ( ( val *= 2 ) < 1 ) {
		return -0.5 * ( Math.sqrt( 1 - val * val ) - 1 );
	}

	return 0.5 * ( Math.sqrt( 1 - ( val -= 2 ) * val ) + 1 );
}

/**
 * Scrolls to the specified window location
 * @param {Object} options - options object (see below)
 * @param {number} options.x - desired left or x coordinate
 * @param {number} options.y - desired top or y coordinate
 * @param {function} options.easing - easing function, defaults to TWEEN.Easing.Circular.Out
 * @param {number} options.duration - duration in ms, default 500
 * @param {function} options.onStart - callback before start is called
 * @param {function} options.onComplete - callback when scroll is finished
 * @param {HTMLElement} options.container - the container to scroll instead of window, if any
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
		easing: options.easing || circularInOutEasing,
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
