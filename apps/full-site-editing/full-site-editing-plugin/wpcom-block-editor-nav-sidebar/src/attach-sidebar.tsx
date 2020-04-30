/**
 * External dependencies
 */
import React, { render, unmountComponentAtNode } from '@wordpress/element';

/**
 * Internal dependencies
 */
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
	const editorLayoutContainer = await findElement( '.edit-post-layout' );
	if ( ! editorLayoutContainer ) {
		return;
	}

	const closePostButton = await findElement( '.edit-post-fullscreen-mode-close' );
	if ( ! closePostButton ) {
		return;
	}

	closePostButton.addEventListener( 'click', ( ev ) => {
		ev.preventDefault();
		toggleSidebar( editorLayoutContainer );
	} );
}

let sidebarExpanded = false;
let sidebarContainer: HTMLDivElement;

function toggleSidebar( editorLayoutContainer: HTMLElement ) {
	if ( sidebarExpanded ) {
		editorLayoutContainer.classList.remove( 'is-wpcom-block-editor-nav-sidebar-opened' );
		unmountComponentAtNode( sidebarContainer );
		sidebarContainer.parentNode?.removeChild( sidebarContainer );
	} else {
		editorLayoutContainer.classList.add( 'is-wpcom-block-editor-nav-sidebar-opened' );
		sidebarContainer = document.createElement( 'div' );
		document.body.appendChild( sidebarContainer );

		render( <WpcomBlockEditorNavSidebar />, sidebarContainer );
	}

	sidebarExpanded = ! sidebarExpanded;
}

attachSidebar();
