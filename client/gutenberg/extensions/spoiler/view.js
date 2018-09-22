/** @format */

/**
 * Internal dependencies
 */
import './style.scss';

function toggleSpoiler( event ) {
	if ( event.target.matches( '.wp-block-a8c-spoiler' ) ) {
		event.target.classList.toggle( 'is-visible' );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	//add click handler on body to check click events for any spoiler tags
	document.body.addEventListener( 'click', toggleSpoiler );
} );
