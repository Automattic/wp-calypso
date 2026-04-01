import './style.scss';
import { recordTracksEvent } from '@automattic/calypso-analytics';

document.addEventListener( 'DOMContentLoaded', function () {
	const links = document.querySelectorAll( 'button[data-search-query]' );
	const input = document.getElementById( 'support-search-input' );
	const submitButton = document.querySelector( '.search-submit-button' );
	const form = document.getElementById( 'support-search-form' );
	links.forEach( ( link ) => {
		link.addEventListener( 'click', function ( e ) {
			const query = this.getAttribute( 'data-search-query' );
			if ( ! input || ! query || ! submitButton ) {
				return;
			}

			const website = this.getAttribute( 'data-website' ) || '';
			recordTracksEvent(
				website === 'forums'
					? 'calypso_happyblocks_forums_suggested_search'
					: 'calypso_happyblocks_support_suggested_search',
				{
					query,
					location: window.location.href,
				}
			);

			e.preventDefault();

			input.value = query;

			const groupIdField = form ? form.querySelector( 'input[name="group_id"]' ) : null;
			if ( groupIdField && window.JetpackInstantSearchOptions?.staticFilters ) {
				const groupFilter = window.JetpackInstantSearchOptions.staticFilters.find(
					( f ) => f.filter_id === 'group_id'
				);
				if ( groupFilter ) {
					groupFilter.selected = groupIdField.value;
				}
			}

			submitButton.click();

			setTimeout( () => {
				input.value = '';
			}, 100 );
		} );
	} );

	if ( form ) {
		form.addEventListener( 'submit', function () {
			const website = form.getAttribute( 'data-website' ) || '';
			recordTracksEvent(
				website === 'forums'
					? 'calypso_happyblocks_forums_custom_search'
					: 'calypso_happyblocks_support_custom_search',
				{
					query: input.value,
					location: window.location.href,
				}
			);
		} );
	}

	// Mobile dropdown functionality
	const dropdown = document.querySelector( '.mobile-nav-dropdown' );
	if ( dropdown ) {
		const trigger = dropdown.querySelector( '.dropdown-trigger' );
		const menu = dropdown.querySelector( '.dropdown-menu' );

		const setOpen = ( open ) => {
			trigger.setAttribute( 'aria-expanded', open );
			menu.classList.toggle( 'show', open );
			document
				.querySelector( '.happy-blocks-search-card' )
				.classList.toggle( 'mobile-dropdown-open', open );
			// Add class to body for global styling
			document.body.classList.toggle( 'mobile-nav-open', open );
		};

		trigger.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			e.stopPropagation();

			setOpen( trigger.getAttribute( 'aria-expanded' ) !== 'true' );
		} );

		document.addEventListener( 'click', ( e ) => {
			if ( ! e.target.closest( '.mobile-nav-dropdown' ) ) {
				setOpen( false );
			}
		} );

		document.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Escape' ) {
				setOpen( false );
			}
		} );
	}
} );
