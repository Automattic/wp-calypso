/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import './style-tour-animation.scss';

/**
 * External dependencies
 */

/**
 * This is a very loose proof of concept for inserting an animation over the block inserter button.
 * Manipulating the DOM as has been done below, is not very robust
 */

export default function TourAnimation( { cardAnimation } ) {
	if ( ! cardAnimation ) {
		return null;
	}
	// The DOM is still rendering when this code runs for first slide, [+] inserter button is NOT in final position
	// The ETK Sidenav (W) button pushes the nav items to the right.
	// const wpIconBtnWidth = 60;
	const animationFrame = 100;

	// Get the [+] block editor inserter button node
	const body = document.body;
	const inserter = body.getElementsByClassName( 'edit-post-header-toolbar__inserter-toggle' )[ 0 ];

	if ( ! inserter ) {
		return null;
	}

	// Find the position in the viewport where the top left corner of the animation frame will be positioned
	// TODO: handle case where user resizes viewport
	const inserterRect = inserter.getBoundingClientRect();
	const animationPosition = {
		left: inserterRect.left + inserterRect.width / 2 - animationFrame / 2,
		top: inserterRect.top + inserterRect.height / 2 - animationFrame / 2,
	};

	return (
		<div className="animation-frame" style={ animationPosition }>
			<div className="inserter-pulse"></div>
		</div>
	);
}
