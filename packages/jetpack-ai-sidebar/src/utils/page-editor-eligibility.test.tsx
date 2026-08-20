/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import {
	getJetpackAiSidebarVisibility,
	useJetpackAiSidebarVisibility,
} from './page-editor-eligibility';

let mockCurrentPostType: string | undefined;
let mockCurrentPostId: string | number | undefined;
const mockEditorStoreListeners = new Set< () => void >();
const mockDataSubscribe = jest.fn( ( listener: () => void ) => {
	mockEditorStoreListeners.add( listener );
	return () => mockEditorStoreListeners.delete( listener );
} );

jest.mock( '@wordpress/data', () => ( {
	select: ( store: string ) =>
		store === 'core/editor'
			? {
					getCurrentPostId: () => mockCurrentPostId,
					getCurrentPostType: () => mockCurrentPostType,
			  }
			: undefined,
	subscribe: ( listener: () => void ) => mockDataSubscribe( listener ),
} ) );

const nativeReplaceState = window.history.replaceState.bind( window.history );

const selfHostedPageEditor = {
	isWpcomPlatform: false,
	isSidebarEnabled: true,
	currentPostType: 'page',
	currentPostId: 42,
	pathname: '/wp-admin/post.php',
	search: '?post=42&action=edit',
	bodyClasses: [ 'post-php', 'post-type-page' ],
};

function setUrl( url: string ) {
	nativeReplaceState( {}, '', url );
}

function setCurrentPostType( postType: string | undefined ) {
	mockCurrentPostType = postType;
	mockEditorStoreListeners.forEach( ( listener ) => listener() );
}

function setCurrentPostId( postId: string | number | undefined ) {
	mockCurrentPostId = postId;
	mockEditorStoreListeners.forEach( ( listener ) => listener() );
}

describe( 'getJetpackAiSidebarVisibility', () => {
	it.each( [
		[ '/wp-admin/post.php', '?post=42&action=edit', [ 'post-php' ], 42 ],
		[ '/wp-admin/post.php', '?post=42&action=edit', [ 'post-new-php' ], 42 ],
		[ '/wp-admin/post-new.php', '?post_type=page', [ 'post-new-php' ], undefined ],
	] )( 'allows the regular page editor at %s', ( pathname, search, bodyClasses, currentPostId ) => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				pathname,
				search,
				bodyClasses,
				currentPostId,
			} )
		).toEqual( { isPageOnly: true, isVisible: true } );
	} );

	it.each( [
		[ '?post=42&action=edit', undefined ],
		[ '?post=42&action=edit', 41 ],
		[ '?post=42', 42 ],
		[ '?post=not-a-number&action=edit', 'not-a-number' ],
	] )( 'rejects the unresolved or mismatched regular page route %s', ( search, currentPostId ) => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				search,
				currentPostId,
			} ).isVisible
		).toBe( false );
	} );

	it( 'allows an actual Site Editor page canvas', () => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				pathname: '/wp-admin/site-editor.php',
				search: '?canvas=edit&p=%2Fpage%2F42',
				currentPostId: 42,
				bodyClasses: [ 'site-editor-php' ],
			} )
		).toEqual( { isPageOnly: true, isVisible: true } );
	} );

	it( 'allows the legacy Site Editor page route', () => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				pathname: '/wp-admin/site-editor.php',
				search: '?canvas=edit&postType=page&postId=42',
				currentPostId: '42',
				bodyClasses: [ 'site-editor-php' ],
			} ).isVisible
		).toBe( true );
	} );

	it.each( [
		[ '?canvas=edit&p=%2Fpage', 42 ],
		[ '?canvas=edit&p=%2Fpage%2Fnot-a-number', 'not-a-number' ],
		[ '?canvas=edit&p=%2Fpage%2F42', undefined ],
		[ '?canvas=edit&p=%2Fpage%2F42', 41 ],
		[ '?canvas=edit&postType=page', 42 ],
		[ '?canvas=edit&p=%2Fstyles&postType=page&postId=42', 42 ],
	] )(
		'rejects the unresolved or mismatched Site Editor page route %s',
		( search, currentPostId ) => {
			expect(
				getJetpackAiSidebarVisibility( {
					...selfHostedPageEditor,
					pathname: '/wp-admin/site-editor.php',
					search,
					currentPostId,
					bodyClasses: [ 'site-editor-php' ],
				} ).isVisible
			).toBe( false );
		}
	);

	it.each( [
		'post',
		'wp_template',
		'wp_template_part',
		'wp_block',
		'wp_navigation',
		'wp_global_styles',
		'product',
		undefined,
	] )( 'rejects the %s entity', ( currentPostType ) => {
		expect(
			getJetpackAiSidebarVisibility( { ...selfHostedPageEditor, currentPostType } ).isVisible
		).toBe( false );
	} );

	it.each( [
		[ '/wp-admin/edit.php', '?post_type=page' ],
		[ '/wp-admin/admin.php', '?page=jetpack-ai' ],
		[ '/wp-admin/site-editor.php', '' ],
		[ '/wp-admin/site-editor.php', '?p=%2Fpage' ],
		[ '/wp-admin/site-editor.php', '?p=%2Fstyles&canvas=edit' ],
		[ '/wp-admin/site-editor.php', '?p=%2Fpattern' ],
		[ '/wp-admin/site-editor.php', '?p=%2Fnavigation' ],
		[ '/wp-admin/site-editor.php', '?p=%2Ftemplate' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fpost%2F42' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fwp_template%2Ftheme%2F%2Findex' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fwp_template_part%2Ftheme%2F%2Fheader' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fwp_block%2F42' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fwp_navigation%2F42' ],
		[ '/wp-admin/site-editor.php', '?canvas=edit&p=%2Fproduct%2F42' ],
	] )( 'rejects the page entity on the unsupported route %s%s', ( pathname, search ) => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				pathname,
				search,
				bodyClasses: pathname.includes( 'site-editor.php' ) ? [ 'site-editor-php' ] : [],
			} ).isVisible
		).toBe( false );
	} );

	it.each( [
		[ 'Simple', true, true ],
		[ 'Atomic', true, true ],
		[ 'unknown platform', undefined, true ],
		[ 'disabled Jetpack sidebar contract', false, false ],
		[ 'non-Jetpack Agents Manager', false, undefined ],
	] )( 'preserves existing %s behavior', ( _label, isWpcomPlatform, isSidebarEnabled ) => {
		expect(
			getJetpackAiSidebarVisibility( {
				...selfHostedPageEditor,
				isWpcomPlatform,
				isSidebarEnabled,
				currentPostType: 'post',
				pathname: '/wp-admin/edit.php',
				search: '',
				bodyClasses: [],
			} )
		).toEqual( { isPageOnly: false, isVisible: true } );
	} );
} );

describe( 'useJetpackAiSidebarVisibility', () => {
	beforeEach( () => {
		mockCurrentPostType = 'page';
		mockCurrentPostId = 42;
		mockDataSubscribe.mockClear();
		mockEditorStoreListeners.clear();
		document.body.className = 'site-editor-php';
		( globalThis as Record< string, unknown > ).agentsManagerData = {
			isWpcomPlatform: false,
			jetpackAiSidebar: { enabled: true },
		};
		setUrl( '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
	} );

	afterEach( () => {
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
		document.body.className = '';
		setUrl( '/' );
	} );

	it( 'reacts to pushState, replaceState, and popstate route transitions', () => {
		const { result } = renderHook( () => useJetpackAiSidebarVisibility() );

		expect( result.current.isVisible ).toBe( true );

		act( () => {
			window.history.pushState( {}, '', '/wp-admin/site-editor.php?p=%2Fstyles&canvas=edit' );
		} );
		expect( result.current.isVisible ).toBe( false );

		act( () => {
			window.history.replaceState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		} );
		expect( result.current.isVisible ).toBe( true );

		act( () => {
			setCurrentPostType( 'wp_template' );
			nativeReplaceState(
				{},
				'',
				'/wp-admin/site-editor.php?canvas=edit&p=%2Fwp_template%2Ftheme%2F%2Findex'
			);
			window.dispatchEvent( new PopStateEvent( 'popstate' ) );
		} );
		expect( result.current.isVisible ).toBe( false );

		act( () => {
			setCurrentPostType( 'page' );
			window.history.pushState( {}, '', '/wp-admin/site-editor.php?canvas=edit&p=%2Fpage%2F42' );
		} );
		expect( result.current.isVisible ).toBe( true );
	} );

	it( 'stays hidden until the page entity resolves', () => {
		mockCurrentPostType = undefined;
		mockCurrentPostId = undefined;
		const { result } = renderHook( () => useJetpackAiSidebarVisibility() );

		expect( result.current.isVisible ).toBe( false );

		act( () => {
			setCurrentPostType( 'page' );
			setCurrentPostId( 42 );
		} );

		expect( result.current.isVisible ).toBe( true );
	} );

	it( 'shares one editor subscription across hook consumers', () => {
		const first = renderHook( () => useJetpackAiSidebarVisibility() );
		const second = renderHook( () => useJetpackAiSidebarVisibility() );

		expect( mockDataSubscribe ).toHaveBeenCalledTimes( 1 );

		first.unmount();
		expect( mockEditorStoreListeners.size ).toBe( 1 );

		second.unmount();
		expect( mockEditorStoreListeners.size ).toBe( 0 );
	} );
} );
