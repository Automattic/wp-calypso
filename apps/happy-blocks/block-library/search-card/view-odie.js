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

	// Track whether Help Center scripts are ready.
	const isLoggedIn = typeof helpCenterData !== 'undefined' && helpCenterData?.currentUser?.ID;
	let helpCenterReady = Boolean( isLoggedIn );

	const disableForm = () => {
		if ( input ) {
			input.setAttribute( 'disabled', '' );
		}
		if ( submitButton ) {
			submitButton.setAttribute( 'disabled', '' );
		}
		links.forEach( ( link ) => link.setAttribute( 'disabled', '' ) );
	};

	const enableForm = () => {
		if ( input ) {
			input.removeAttribute( 'disabled' );
		}
		if ( submitButton ) {
			submitButton.removeAttribute( 'disabled' );
		}
		links.forEach( ( link ) => link.removeAttribute( 'disabled' ) );
	};

	const enableFormWhenChatAppears = () => {
		if ( document.querySelector( '.help-center__container' ) ) {
			enableForm();
			return;
		}

		let resolved = false;
		const observer = new MutationObserver( () => {
			if ( document.querySelector( '.help-center__container' ) ) {
				resolved = true;
				enableForm();
				observer.disconnect();
			}
		} );
		observer.observe( document.body, { childList: true, subtree: true } );

		setTimeout( () => {
			if ( ! resolved ) {
				observer.disconnect();
				enableForm();
			}
		}, 10000 );
	};

	if ( ! helpCenterReady ) {
		helpCenterReadyToLoadPromise.then( () => {
			helpCenterReady = true;
		} );
	}

	links.forEach( ( link ) => {
		link.addEventListener( 'click', function ( e ) {
			const query = this.dataset.searchQuery;
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
				input.value = '';

				const website = form.getAttribute( 'data-website' ) || '';
				recordTracksEvent(
					website === 'forums'
						? 'calypso_happyblocks_forums_ask_odie'
						: 'calypso_happyblocks_support_ask_odie',
					{
						query: searchQuery,
						location: window.location.href,
					}
				);
				const isLoggedOut = ! helpCenterData?.currentUser?.ID;

				if ( isLoggedOut ) {
					if ( ! helpCenterReady ) {
						disableForm();
						await Promise.race( [
							helpCenterReadyToLoadPromise,
							new Promise( ( resolve ) => setTimeout( resolve, 5000 ) ),
						] );
						if ( ! helpCenterReady ) {
							enableForm();
							return;
						}
					}
					enableFormWhenChatAppears();
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
					enableFormWhenChatAppears();
					const helpCenterDispatch = window.wp.data.dispatch( 'automattic/help-center' );
					helpCenterDispatch.setNavigateToRoute(
						'/odie?query=' + encodeURIComponent( searchQuery ),
						true
					);
					helpCenterDispatch.setShowHelpCenter( true );
				} else {
					enableForm();
				}
			},
			true
		);
	}

	// Signal that our submit handler is attached, so the inline fallback
	// stops blocking native form submission.
	window.__hcFormReady = true;

	// Process any query that was submitted before JS loaded.
	if ( window.__hcPendingQuery ) {
		const pendingQuery = window.__hcPendingQuery;
		delete window.__hcPendingQuery;
		input.value = pendingQuery;
		enableForm();
		submitButton.click();
	} else {
		// Only re-enable here if there's no pending query — the submit
		// handler manages form state when processing a query.
		enableForm();
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
