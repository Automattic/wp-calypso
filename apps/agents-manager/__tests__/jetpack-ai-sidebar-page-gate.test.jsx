/**
 * @jest-environment jsdom
 */

import { useEffect, useLayoutEffect } from '@wordpress/element';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import JetpackAiSidebarPageGate, {
	JETPACK_AI_SIDEBAR_HIDDEN_CLASS,
} from '../jetpack-ai-sidebar-page-gate';

jest.mock( '@automattic/agents-manager/src/utils/discard-current-agent', () => ( {
	discardCurrentAgentsManagerAgent: jest.fn(),
} ) );
const { discardCurrentAgentsManagerAgent: mockDiscardCurrentAgentsManagerAgent } = jest.requireMock(
	'@automattic/agents-manager/src/utils/discard-current-agent'
);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockCurrentPostId;
let mockCurrentPostType;
const mockEditorStoreListeners = new Set();

jest.mock( '@wordpress/data', () => {
	return {
		select: ( store ) =>
			store === 'core/editor'
				? {
						getCurrentPostId: () => mockCurrentPostId,
						getCurrentPostType: () => mockCurrentPostType,
				  }
				: undefined,
		subscribe: ( listener ) => {
			mockEditorStoreListeners.add( listener );
			return () => mockEditorStoreListeners.delete( listener );
		},
	};
} );

const nativeReplaceState = window.history.replaceState.bind( window.history );
// jsdom cannot load SCSS; the companion style test checks the real override.
const adminBarStyles = `
	body.jetpack-ai-sidebar-page-ineligible
		#wpadminbar
		#wp-toolbar
		#wp-admin-bar-top-secondary
		#wp-admin-bar-agents-manager-ai-chat {
			display: none !important;
		}
`;

let adminBarClick;
let discardedResolvedAgentIds;
let entryPointsMount;
let entryPointsUnmount;
let mockResolvedAgentId;
const mountedRoots = new Set();

function EntryPoints() {
	// Mirrors the real context provider publishing an unresolved agent during a keyed remount.
	useLayoutEffect( () => {
		mockResolvedAgentId = undefined;
	}, [] );

	useEffect( () => {
		entryPointsMount( [ ...( globalThis.agentsManagerData?.agentProviders ?? [] ) ] );
		const adminBarButton = document.getElementById( 'wp-admin-bar-agents-manager-ai-chat' );
		adminBarButton?.addEventListener( 'click', adminBarClick );
		return () => {
			entryPointsUnmount();
			adminBarButton?.removeEventListener( 'click', adminBarClick );
		};
	}, [] );

	return (
		<>
			<div data-testid="editor-header-ask-ai" />
			<div data-testid="agents-manager-dock" />
			<div data-testid="agents-manager-fab" />
		</>
	);
}

function renderGate() {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );
	mountedRoots.add( root );

	act( () => {
		root.render(
			<JetpackAiSidebarPageGate>
				<EntryPoints />
			</JetpackAiSidebarPageGate>
		);
	} );

	return {
		unmount: () => {
			act( () => root.unmount() );
			mountedRoots.delete( root );
			container.remove();
		},
	};
}

function getEntryPoint( testId ) {
	return document.querySelector( `[data-testid="${ testId }"]` );
}

function installAdminBar() {
	const style = document.createElement( 'style' );
	style.textContent = adminBarStyles;
	document.head.appendChild( style );

	document.body.insertAdjacentHTML(
		'afterbegin',
		'<div id="wpadminbar"><div id="wp-toolbar"><ul id="wp-admin-bar-top-secondary"><li id="wp-admin-bar-agents-manager-ai-chat"><button>Ask AI</button></li></ul></div></div>'
	);

	return document.getElementById( 'wp-admin-bar-agents-manager-ai-chat' );
}

function installSelfHostedContract() {
	globalThis.agentsManagerData = {
		isWpcomPlatform: false,
		agentProviders: [ 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs' ],
		jetpackAiSidebar: { enabled: true },
	};
}

describe( 'JetpackAiSidebarPageGate', () => {
	beforeEach( () => {
		adminBarClick = jest.fn();
		discardedResolvedAgentIds = [];
		entryPointsMount = jest.fn();
		entryPointsUnmount = jest.fn();
		mockDiscardCurrentAgentsManagerAgent.mockReset();
		mockDiscardCurrentAgentsManagerAgent.mockImplementation( () => {
			discardedResolvedAgentIds.push( mockResolvedAgentId );
		} );
		mockResolvedAgentId = undefined;
		mockCurrentPostId = 42;
		mockCurrentPostType = 'page';
		mockEditorStoreListeners.clear();
		document.body.className = '';
		document.body.innerHTML = '';
		document.head.innerHTML = '';
		nativeReplaceState( {}, '', '/' );
		delete globalThis.agentsManagerData;
	} );

	afterEach( () => {
		mountedRoots.forEach( ( root ) => {
			act( () => root.unmount() );
		} );
		mountedRoots.clear();
		delete globalThis.agentsManagerData;
		document.body.className = '';
		nativeReplaceState( {}, '', '/' );
	} );

	it( 'keeps every React entry point on a connected self-hosted page editor', () => {
		installSelfHostedContract();
		document.body.className = 'post-php post-type-page';
		nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
		const adminBarButton = installAdminBar();

		renderGate();

		expect( getEntryPoint( 'editor-header-ask-ai' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).not.toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).not.toBe( 'none' );
	} );

	it( 'keeps every entry point when saving a new page rewrites the editor URL', () => {
		installSelfHostedContract();
		mockCurrentPostId = undefined;
		document.body.className = 'post-new-php post-type-page';
		nativeReplaceState( {}, '', '/wp-admin/post-new.php?post_type=page' );
		const adminBarButton = installAdminBar();

		renderGate();

		act( () => {
			nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
			mockCurrentPostId = 42;
			mockEditorStoreListeners.forEach( ( listener ) => listener() );
		} );

		expect( getEntryPoint( 'editor-header-ask-ai' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).not.toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).not.toBe( 'none' );
	} );

	it( 'omits every entry point and leaves the admin-bar node inert off page editors', () => {
		installSelfHostedContract();
		mockCurrentPostType = 'post';
		document.body.className = 'post-php post-type-post';
		nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
		const adminBarButton = installAdminBar();

		renderGate();
		adminBarButton.click();

		expect( getEntryPoint( 'editor-header-ask-ai' ) ).toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).toBeNull();
		expect( document.body.classList.contains( JETPACK_AI_SIDEBAR_HIDDEN_CLASS ) ).toBe( true );
		expect( window.getComputedStyle( adminBarButton ).display ).toBe( 'none' );
		expect( adminBarClick ).not.toHaveBeenCalled();
	} );

	it( 'removes and restores all entry points during Site Editor navigation', () => {
		installSelfHostedContract();
		document.body.className = 'site-editor-php';
		nativeReplaceState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		const adminBarButton = installAdminBar();

		renderGate();
		mockResolvedAgentId = 'wp-orchestrator';
		expect( getEntryPoint( 'editor-header-ask-ai' ) ).not.toBeNull();
		adminBarButton.click();
		expect( adminBarClick ).toHaveBeenCalledTimes( 1 );

		act( () => {
			window.history.pushState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		} );
		expect( getEntryPoint( 'editor-header-ask-ai' ) ).toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).toBe( 'none' );
		expect( mockDiscardCurrentAgentsManagerAgent ).toHaveBeenCalledTimes( 1 );
		expect( discardedResolvedAgentIds ).toEqual( [ 'wp-orchestrator' ] );
		adminBarButton.click();
		expect( adminBarClick ).toHaveBeenCalledTimes( 1 );

		act( () => {
			window.history.replaceState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		} );
		expect( getEntryPoint( 'editor-header-ask-ai' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).not.toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).not.toBe( 'none' );
	} );

	it( 'filters only Jetpack AI while preserving another provider', () => {
		const jetpackProvider = 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs';
		const otherProvider = 'https://widgets.wp.com/agents-manager/big-sky.provider.mjs';
		installSelfHostedContract();
		globalThis.agentsManagerData.agentProviders = [ jetpackProvider, otherProvider ];
		document.body.className = 'site-editor-php';
		nativeReplaceState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		const adminBarButton = installAdminBar();

		renderGate();
		mockResolvedAgentId = 'big-sky';

		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ otherProvider ] );
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).not.toBe( 'none' );
		expect( entryPointsMount ).toHaveBeenCalledTimes( 1 );
		expect( entryPointsMount ).toHaveBeenNthCalledWith( 1, [ otherProvider ] );

		act( () => {
			window.history.pushState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		} );

		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [
			jetpackProvider,
			otherProvider,
		] );
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( window.getComputedStyle( adminBarButton ).display ).not.toBe( 'none' );
		expect( entryPointsUnmount ).toHaveBeenCalledTimes( 1 );
		expect( entryPointsMount ).toHaveBeenCalledTimes( 2 );
		expect( entryPointsMount ).toHaveBeenNthCalledWith( 2, [ jetpackProvider, otherProvider ] );
		mockResolvedAgentId = 'wp-orchestrator';

		act( () => {
			window.history.replaceState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		} );

		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ otherProvider ] );
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( entryPointsUnmount ).toHaveBeenCalledTimes( 2 );
		expect( entryPointsMount ).toHaveBeenCalledTimes( 3 );
		expect( entryPointsMount ).toHaveBeenNthCalledWith( 3, [ otherProvider ] );
		expect( mockDiscardCurrentAgentsManagerAgent ).toHaveBeenCalledTimes( 2 );
		expect( discardedResolvedAgentIds ).toEqual( [ 'big-sky', 'wp-orchestrator' ] );
	} );

	it.each( [
		[ 'Simple', { isWpcomPlatform: true, jetpackAiSidebar: { enabled: true } } ],
		[ 'Atomic', { isWpcomPlatform: true, jetpackAiSidebar: { enabled: true } } ],
		[ 'unknown platform', { jetpackAiSidebar: { enabled: true } } ],
		[ 'non-Jetpack Agents Manager', { isWpcomPlatform: false } ],
	] )( 'preserves %s Agents Manager behavior', ( _label, inlineData ) => {
		globalThis.agentsManagerData = inlineData;
		mockCurrentPostType = 'post';
		nativeReplaceState( {}, '', '/wp-admin/edit.php' );

		renderGate();

		expect( getEntryPoint( 'editor-header-ask-ai' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-dock' ) ).not.toBeNull();
		expect( getEntryPoint( 'agents-manager-fab' ) ).not.toBeNull();
		expect( document.body.classList.contains( JETPACK_AI_SIDEBAR_HIDDEN_CLASS ) ).toBe( false );
	} );

	it( 'removes the admin-bar suppression class when the gate unmounts', () => {
		installSelfHostedContract();
		mockCurrentPostType = 'post';
		nativeReplaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
		const { unmount } = renderGate();

		expect( document.body.classList.contains( JETPACK_AI_SIDEBAR_HIDDEN_CLASS ) ).toBe( true );

		unmount();

		expect( document.body.classList.contains( JETPACK_AI_SIDEBAR_HIDDEN_CLASS ) ).toBe( false );
	} );
} );
