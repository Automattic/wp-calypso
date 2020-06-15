/**
 * External dependencies
 */
import { dispatch, select, subscribe } from '@wordpress/data';
import React, { render } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import WpcomBlockEditorNavSidebar, { selectNavItems } from './components/nav-sidebar';

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

	addFilter( 'a8c.wpcom-block-editor.shouldCloseEditor', 'a8c/fse/attachSidebar', () => false );

	// Teach core data about the status entity so we can use selectors like `getEntityRecords()`
	dispatch( 'core' ).addEntities( [
		{
			baseURL: '/wp/v2/statuses',
			key: 'slug',
			kind: 'root',
			name: 'status',
			plural: 'statuses',
		},
	] );

	// Classes need to be attached to elements that aren't controlled by React,
	// otherwise our alterations will be removed when React re-renders. So attach
	// to <body> element.
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

	// Start pre-loading sidebar content
	selectNavItems( select );
}

attachSidebar();
