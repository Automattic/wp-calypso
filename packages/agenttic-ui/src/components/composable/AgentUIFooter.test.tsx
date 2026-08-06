// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	ComplianceDisclosure,
	DefaultComplianceDisclosure,
} from '../chat/ComplianceDisclosure';

describe( 'ComplianceDisclosure', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		act( () => root.unmount() );
		container.remove();
	} );

	const render = ( node: React.ReactNode ) => {
		act( () => root.render( node ) );
	};

	const slot = () =>
		container.querySelector( '[data-slot="chat-compliance-disclosure"]' );

	it( 'renders its children inside the disclosure slot', () => {
		render( <ComplianceDisclosure>AI notice</ComplianceDisclosure> );

		expect( slot() ).not.toBeNull();
		expect( slot()?.textContent ).toBe( 'AI notice' );
	} );

	it( 'renders nothing for the explicit `false` sentinel', () => {
		render( <ComplianceDisclosure>{ false }</ComplianceDisclosure> );

		expect( slot() ).toBeNull();
	} );

	it( 'renders nothing for nullish values', () => {
		render( <ComplianceDisclosure>{ null }</ComplianceDisclosure> );
		expect( slot() ).toBeNull();

		render( <ComplianceDisclosure>{ undefined }</ComplianceDisclosure> );
		expect( slot() ).toBeNull();
	} );

	it( 'still renders the slot for other falsy nodes (not silently hidden)', () => {
		// A computed '' or 0 must not be treated as the hide sentinel — the
		// wrapper stays in the DOM so the omission is visible, not silent.
		render( <ComplianceDisclosure>{ '' }</ComplianceDisclosure> );
		expect( slot() ).not.toBeNull();

		render( <ComplianceDisclosure>{ 0 }</ComplianceDisclosure> );
		expect( slot()?.textContent ).toBe( '0' );
	} );
} );

describe( 'DefaultComplianceDisclosure', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		act( () => root.unmount() );
		container.remove();
	} );

	it( 'renders the AI sentence with a safe guidelines link', () => {
		act( () => root.render( <DefaultComplianceDisclosure /> ) );

		expect( container.textContent ).toContain( 'You’re chatting with AI.' );

		const link = container.querySelector( 'a' );
		expect( link?.getAttribute( 'href' ) ).toBe(
			'https://automattic.com/ai-guidelines/'
		);
		expect( link?.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link?.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
		expect( link?.getAttribute( 'aria-label' ) ).toBe(
			'Guidelines (opens in a new tab)'
		);
		expect( link?.textContent ).toBe( 'Guidelines' );
	} );
} );
