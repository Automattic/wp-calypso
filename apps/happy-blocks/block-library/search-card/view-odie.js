/* eslint-disable no-undef */
import './style.scss';
import { recordTracksEvent } from '@automattic/calypso-analytics';

const { promise: helpCenterReadyToLoadPromise, resolve: resolveHelpCenterReadyToLoad } =
	Promise.withResolvers();

// Logged out asynchronous variant: wait until the Help Center is available for loading.
document.addEventListener( 'help-center-ready-to-load', resolveHelpCenterReadyToLoad, {
	once: true,
} );

document.addEventListener( 'DOMContentLoaded', function () {
	const links = document.querySelectorAll( 'button[data-search-query]' );
	const submitButton = document.querySelector( '.search-submit-button' );
	const form = document.getElementById( 'support-search-form' );
	const input = document.getElementById( 'support-search-input' );

	links.forEach( ( link ) => {
		link.addEventListener( 'click', function ( e ) {
			const query = this.dataset.searchQuery;
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
			input.value = '';
		} );
	} );

	if ( form ) {
		form.addEventListener(
			'submit',
			async function ( e ) {
				e.preventDefault();
				e.stopPropagation();

				// Use the submitted value, not the input.value since it's already cleared.
				const searchQuery = new FormData( form ).get( 'odie-query' );

				recordTracksEvent( 'calypso_happyblocks_support_ask_odie', {
					query: searchQuery,
					location: window.location.href,
				} );
				const isLoggedOut = ! helpCenterData?.currentUser?.ID;

				if ( isLoggedOut ) {
					await helpCenterReadyToLoadPromise;
					window.helpCenter?.loadHelpCenter().then( () => {
						if ( window.wp?.data?.dispatch ) {
							const helpCenterDispatch = window.wp.data.dispatch( 'automattic/help-center' );

							helpCenterDispatch.setNavigateToRoute(
								'/odie?query=' + encodeURIComponent( searchQuery ),
								true
							);
							helpCenterDispatch.setShowHelpCenter( true );
						}
					} );
				} else if ( window.wp?.data?.dispatch ) {
					// Logged in variant is already loaded.
					const helpCenterDispatch = window.wp.data.dispatch( 'automattic/help-center' );
					helpCenterDispatch.setNavigateToRoute(
						'/odie?query=' + encodeURIComponent( searchQuery ),
						true
					);
					helpCenterDispatch.setShowHelpCenter( true );
				}
			},
			true
		);
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
