import './style.scss';
import { recordTracksEvent } from '@automattic/calypso-analytics';

document.addEventListener( 'DOMContentLoaded', function () {
	const links = document.querySelectorAll( 'a[data-search-query]' );
	const input = document.getElementById( 'support-search-input' );
	const submitButton = document.querySelector( '.search-submit-button' );
	const form = document.getElementById( 'support-search-form' );

	links.forEach( ( link ) => {
		link.addEventListener( 'click', function ( e ) {
			const query = this.getAttribute( 'data-search-query' );
			if ( ! input || ! query || ! submitButton ) {
				return;
			}

			recordTracksEvent( 'calypso_happyblocks_support_suggested_search', {
				query,
				location: window.location.href,
			} );

			e.preventDefault();

			input.value = query;
			submitButton.click();

			setTimeout( () => {
				input.value = '';
			}, 100 );
		} );
	} );

	if ( form ) {
		form.addEventListener( 'submit', function () {
			recordTracksEvent( 'calypso_happyblocks_support_custom_search', {
				query: input.value,
				location: window.location.href,
			} );
		} );
	}
} );
