/** @jest-environment jsdom */

import { act, cleanup, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { combineReducers, createStore } from 'redux';
import { setDocumentHeadLink, setDocumentHeadMeta } from 'calypso/state/document-head/actions';
import reducer from 'calypso/state/document-head/reducer';
import DocumentHead from '..';

const Writer = DocumentHead.WrappedComponent;
const description = ( content ) => ( { name: 'description', content } );
const canonical = ( href ) => ( { rel: 'canonical', href } );
const getDescription = () => document.head.querySelector( 'meta[name="description"]' );
const getCanonical = () => document.head.querySelector( 'link[rel="canonical"]' );

function createProps( props = {} ) {
	return {
		formattedTitle: 'Page title',
		setTitle: jest.fn(),
		setUnreadCount: jest.fn(),
		setLink: jest.fn(),
		setMeta: jest.fn(),
		...props,
	};
}

describe( 'DocumentHead browser metadata', () => {
	test( 'renders a single link object and deduplicates repeated entries', () => {
		const link = canonical( 'https://example.com/page' );
		const props = createProps();
		const { rerender } = render( <Writer { ...props } link={ link } /> );
		expect( getCanonical() ).toHaveAttribute( 'href', link.href );
		rerender( <Writer { ...props } link={ [ link, { ...link } ] } /> );
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
	} );

	test( 'removes managed tags when props are cleared', () => {
		const props = createProps();
		const { rerender } = render(
			<Writer
				{ ...props }
				meta={ [ description( 'Page' ) ] }
				link={ [ canonical( 'https://example.com/page' ) ] }
			/>
		);
		rerender( <Writer { ...props } meta={ [] } link={ [] } /> );
		expect( getDescription() ).toBeNull();
		expect( getCanonical() ).toBeNull();
	} );

	test( 'takes over server http-equiv metadata using React attribute names', () => {
		document.head.innerHTML = '<meta http-equiv="refresh" content="30" data-calypso-document-head>';
		render( <Writer { ...createProps() } meta={ [ { httpEquiv: 'refresh', content: '60' } ] } /> );
		expect( document.head.querySelectorAll( 'meta[http-equiv="refresh"]' ) ).toHaveLength( 1 );
		expect( document.head.querySelector( 'meta[http-equiv="refresh"]' ) ).toHaveAttribute(
			'content',
			'60'
		);
	} );

	beforeEach( () => {
		document.head.innerHTML = '';
	} );
	afterEach( () => {
		cleanup();
		document.head.innerHTML = '';
	} );

	test( 'renders meta and link attributes into the head', () => {
		const { container } = render(
			<Writer
				{ ...createProps() }
				meta={ [
					description( 'A page description' ),
					{ property: 'og:title', content: 'A page title' },
				] }
				link={ [
					canonical( 'https://example.com/page' ),
					{ rel: 'alternate', href: 'https://example.com/es/page', hrefLang: 'es' },
				] }
			/>
		);
		expect( getDescription() ).toHaveAttribute( 'content', 'A page description' );
		expect( document.head.querySelector( 'meta[property="og:title"]' ) ).toHaveAttribute(
			'content',
			'A page title'
		);
		expect( getCanonical() ).toHaveAttribute( 'href', 'https://example.com/page' );
		expect( document.head.querySelector( 'link[rel="alternate"]' ) ).toHaveAttribute(
			'hreflang',
			'es'
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'updates changed props and removes tags no longer supplied', () => {
		const props = createProps();
		const { rerender } = render(
			<Writer
				{ ...props }
				meta={ [ description( 'First page' ), { name: 'keywords', content: 'first' } ] }
				link={ [ canonical( 'https://example.com/first' ) ] }
			/>
		);
		rerender(
			<Writer
				{ ...props }
				meta={ [ description( 'Next page' ) ] }
				link={ [ canonical( 'https://example.com/next' ) ] }
			/>
		);
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( getDescription() ).toHaveAttribute( 'content', 'Next page' );
		expect( document.head.querySelector( 'meta[name="keywords"]' ) ).toBeNull();
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
		expect( getCanonical() ).toHaveAttribute( 'href', 'https://example.com/next' );
	} );

	test( 'replaces matching server tags and preserves noindex and unrelated head nodes', () => {
		document.head.innerHTML =
			'<meta name="viewport" content="width=device-width"><meta name="robots" content="noindex" data-calypso-document-head><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/app.css"><link rel="alternate" hreflang="es" href="https://example.com/es" data-calypso-document-head><meta name="description" content="Server description" data-calypso-document-head><link rel="canonical" href="https://example.com/old" data-calypso-document-head>';
		const preservedNodes = [
			...document.head.querySelectorAll(
				'meta[name="viewport"], meta[name="robots"], link:not([rel="canonical"])'
			),
		];
		render(
			<Writer
				{ ...createProps() }
				meta={ [ description( 'Client description' ) ] }
				link={ [ canonical( 'https://example.com/page' ) ] }
			/>
		);
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( getDescription() ).toHaveAttribute( 'content', 'Client description' );
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
		expect( document.head.querySelector( 'meta[name="robots"]' ) ).toHaveAttribute(
			'content',
			'noindex'
		);
		preservedNodes.forEach( ( node ) => expect( node.parentNode ).toBe( document.head ) );
	} );

	test( 'takes over matching server tags when props arrive after mount', () => {
		document.head.innerHTML =
			'<meta name="description" content="Server" data-calypso-document-head>';
		const props = createProps();
		const { rerender } = render( <Writer { ...props } /> );
		rerender( <Writer { ...props } meta={ [ description( 'Loaded' ) ] } /> );
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( getDescription() ).toHaveAttribute( 'content', 'Loaded' );
	} );

	test( 'title-only instances do not duplicate or remove metadata', async () => {
		render(
			<>
				<Writer { ...createProps() } />
				<Writer
					{ ...createProps() }
					meta={ [ description( 'Page' ) ] }
					link={ [ canonical( 'https://example.com/page' ) ] }
				/>
			</>
		);
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
		await waitFor( () => expect( document.title ).toBe( 'Page title' ) );
	} );

	test( 'removes its tags on unmount and can render them again', () => {
		document.head.innerHTML = '<meta name="viewport" content="width=device-width">';
		const props = createProps( {
			meta: [ description( 'Page' ) ],
			link: [ canonical( 'https://example.com/page' ) ],
		} );
		const { unmount } = render( <Writer { ...props } /> );
		unmount();
		expect( getDescription() ).toBeNull();
		expect( getCanonical() ).toBeNull();
		expect( document.head.querySelector( 'meta[name="viewport"]' ) ).not.toBeNull();
		render( <Writer { ...props } /> );
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
	} );

	test( 'preserves existing Redux actions and link accumulation', () => {
		const store = createStore( combineReducers( { documentHead: reducer } ) );
		const props = createProps( {
			setLink: ( link ) => store.dispatch( setDocumentHeadLink( link ) ),
			setMeta: ( meta ) => store.dispatch( setDocumentHeadMeta( meta ) ),
		} );
		const first = canonical( 'https://example.com/page' );
		const alternate = { rel: 'alternate', href: 'https://example.com/es/page', hrefLang: 'es' };
		const { rerender } = render( <Writer { ...props } link={ [ first ] } /> );
		rerender( <Writer { ...props } link={ [ first, alternate ] } meta={ [] } /> );
		expect( store.getState().documentHead.link ).toEqual( [ first, alternate ] );
		expect( store.getState().documentHead.meta ).toEqual( [] );
		expect( document.head.querySelectorAll( 'link' ) ).toHaveLength( 2 );
	} );

	test( 'leaves server layout output empty for the existing head renderer', () => {
		expect(
			renderToString( <Writer { ...createProps() } meta={ [ description( 'Page' ) ] } /> )
		).toBe( '' );
	} );

	test( 'hands off server tags after hydration without a mismatch', async () => {
		document.head.innerHTML =
			'<meta name="description" content="Server" data-calypso-document-head><link rel="canonical" href="https://example.com/page" data-calypso-document-head>';
		const tree = (
			<>
				<Writer
					{ ...createProps() }
					meta={ [ description( 'Server' ) ] }
					link={ [ canonical( 'https://example.com/page' ) ] }
				/>
				<div>Page content</div>
			</>
		);
		const container = document.createElement( 'div' );
		container.innerHTML = renderToString( tree );
		document.body.appendChild( container );
		const onRecoverableError = jest.fn();
		let root;
		await act( async () => {
			root = hydrateRoot( container, tree, { onRecoverableError } );
		} );
		expect( onRecoverableError ).not.toHaveBeenCalled();
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
		expect( document.head.querySelectorAll( 'link[rel="canonical"]' ) ).toHaveLength( 1 );
		act( () => root.unmount() );
		container.remove();
	} );

	test( 'keeps a single set of tags under StrictMode', () => {
		render(
			<StrictMode>
				<Writer { ...createProps() } meta={ [ description( 'Page' ) ] } />
			</StrictMode>
		);
		expect( document.head.querySelectorAll( 'meta[name="description"]' ) ).toHaveLength( 1 );
	} );
} );
