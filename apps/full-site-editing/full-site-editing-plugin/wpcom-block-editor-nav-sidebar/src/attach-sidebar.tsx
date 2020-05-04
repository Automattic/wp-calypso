/**
 * External dependencies
 */
import { dispatch, select, subscribe } from '@wordpress/data';
import React, { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import WpcomBlockEditorNavSidebar from './wpcom-block-editor-nav-sidebar';
import './style.scss';

async function findElement( selector: string, timeoutMs = 5000 ) {
	let pendingQuery;
	const pollForLoadedFlag = new Promise< HTMLElement >( ( resolve ) => {
		const runQuery = () => {
			const element = document.querySelector( selector ) as HTMLElement;

			if ( ! element ) {
				pendingQuery = setTimeout( runQuery, 200 );
				return;
			}

			resolve( element );
		};

		runQuery();
	} );

	const timeout = new Promise< 'timeout' >( ( resolve ) =>
		setTimeout( resolve, timeoutMs, 'timeout' )
	);

	const finishCondition = await Promise.race( [ pollForLoadedFlag, timeout ] );
	clearTimeout( pendingQuery );

	if ( finishCondition === 'timeout' ) {
		return undefined;
	}

	return finishCondition;
}

async function attachSidebar() {
	const closePostButton = await findElement( '.edit-post-fullscreen-mode-close' );
	if ( ! closePostButton ) {
		return;
	}

	// Classes need to be attached to elements that aren't controlled by React,
	// otherwise our alterations will be removed when React re-renders.
	document.body.classList.add( 'is-wpcom-block-editor-nav-sidebar-attached' );

	closePostButton.addEventListener( 'click', ( ev ) => {
		ev.preventDefault();
		dispatch( STORE_KEY ).toggleSidebar();
	} );

	let sidebarExpanded = false;
	subscribe( () => {
		const newSidebarState = select( STORE_KEY ).isSidebarOpened();
		if ( sidebarExpanded === newSidebarState ) {
			return;
		}

		sidebarExpanded = newSidebarState;

		if ( sidebarExpanded ) {
			document.body.classList.add( 'is-wpcom-block-editor-nav-sidebar-opened' );
		} else {
			document.body.classList.remove( 'is-wpcom-block-editor-nav-sidebar-opened' );
		}
	} );

	const sidebarContainer = document.createElement( 'div' );
	document.body.appendChild( sidebarContainer );
	render( <WpcomBlockEditorNavSidebar />, sidebarContainer );

	// Start resolving page data
	select( STORE_KEY ).getPages();
}

attachSidebar();
