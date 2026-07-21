/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ReviewCard, { type ReviewCardProps, type ReviewCardRow } from './review-card';

// Mock the block registry + icon renderer so BlockRef's lookups are
// deterministic and don't pull in the full editor.
jest.mock( '@wordpress/blocks', () => ( {
	getBlockType: jest.fn(),
} ) );
jest.mock( '@wordpress/block-editor', () => {
	const react = jest.requireActual< typeof import('react') >( 'react' );
	const { RawHTML } =
		jest.requireActual< typeof import('@wordpress/element') >( '@wordpress/element' );
	return {
		BlockIcon: () => react.createElement( 'span', { 'data-testid': 'block-icon' } ),
		RichText: {
			Content: ( { tagName = 'div', value, ...props }: Record< string, unknown > ) =>
				react.createElement(
					tagName as string,
					props,
					react.createElement( RawHTML, null, value as string )
				),
		},
	};
} );

function renderCard( bodyRows: ReviewCardRow[] ) {
	const props: ReviewCardProps = {
		model: {
			badge: 'Clarity (1/1)',
			isManualEdit: false,
			blockIndex: null,
			bodyRows,
		},
		blocks: [],
		status: 'pending',
		showApply: true,
		canGoToSection: false,
		showCopy: false,
		copied: false,
		disabled: false,
		failureMessage: '',
		onApply: jest.fn(),
		onGoToSection: jest.fn(),
		onCopy: jest.fn(),
		onDismiss: jest.fn(),
		onUndo: jest.fn(),
	};
	return render( <ReviewCard { ...props } /> );
}

describe( 'ReviewCard rich-text rows', () => {
	it( 'renders server-provided preview HTML as elements instead of literal tags', () => {
		const { container } = renderCard( [
			{
				tag: 'Current',
				text: '<strong>raw current text</strong>',
				previewHtml: '<strong>Consultation</strong> opens on next week.',
				variant: 'current',
				element: 'del',
			},
			{
				tag: 'New',
				text: '<em>raw suggested text</em>',
				previewHtml: '<strong>Consultation</strong> <em>opens</em> on 1 May.',
				variant: 'new',
				element: 'ins',
			},
		] );

		const del = container.querySelector( 'del' );
		const ins = container.querySelector( 'ins' );
		expect( del?.querySelector( 'strong' ) ).toHaveTextContent( 'Consultation' );
		expect( ins?.querySelector( 'em' ) ).toHaveTextContent( 'opens' );
		// The tag characters themselves never appear as visible text.
		expect( del?.textContent ).toBe( 'Consultation opens on next week.' );
		expect( ins?.textContent ).toBe( 'Consultation opens on 1 May.' );
	} );

	it( 'decodes entities in HTML rows', () => {
		const { container } = renderCard( [
			{
				tag: 'New',
				text: 'Fees &amp; charges',
				previewHtml: 'Fees &amp; charges',
				variant: 'new',
				element: 'ins',
			},
		] );

		expect( container.querySelector( 'ins' )?.textContent ).toBe( 'Fees & charges' );
	} );

	it( 'preserves formatting elements and attributes without a client-side allowlist', () => {
		const { container } = renderCard( [
			{
				tag: 'New',
				text: 'colour underlined removed ref2 linked',
				previewHtml:
					'<mark class="has-inline-color" style="color:red">colour</mark> <span style="text-decoration:underline">underlined</span> <s>removed</s> ref<sup>2</sup> <a href="https://example.com">linked</a>',
				variant: 'new',
				element: 'ins',
			},
		] );

		const richText = container.querySelector( 'ins' );
		expect( richText?.querySelector( 'mark.has-inline-color' ) ).toHaveStyle( 'color: red' );
		expect( richText?.querySelector( 'span' ) ).toHaveStyle( 'text-decoration: underline' );
		expect( richText?.querySelector( 's' ) ).toHaveTextContent( 'removed' );
		expect( richText?.querySelector( 'sup' ) ).toHaveTextContent( '2' );
		expect( richText?.querySelector( 'a' ) ).toHaveAttribute( 'href', 'https://example.com' );
	} );

	it( 'renders an HTML Suggestion text row with formatting', () => {
		const { container } = renderCard( [
			{
				tag: 'Suggestion',
				text: 'Use bold sparingly.',
				previewHtml: 'Use <strong>bold</strong> sparingly.',
				variant: 'new',
				element: 'text',
			},
		] );

		const text = container.querySelector( '.jetpack-ai-feedback-list__diff-text' );
		expect( text?.tagName ).toBe( 'DIV' );
		expect( container.querySelector( 'span > div' ) ).not.toBeInTheDocument();
		expect( text?.querySelector( 'strong' ) ).toHaveTextContent( 'bold' );
		expect( text?.textContent ).toBe( 'Use bold sparingly.' );
	} );

	it( 'keeps prose rows as literal text, tags included', () => {
		renderCard( [
			{
				tag: 'Why',
				text: 'Change the <h3> to an <h2>.',
				variant: 'current',
				element: 'text',
			},
		] );

		expect( screen.getByText( 'Change the <h3> to an <h2>.' ) ).toBeInTheDocument();
	} );

	it( 'renders raw HTML-like text literally when no preview field is available', () => {
		const { container } = renderCard( [
			{
				tag: 'New',
				text: '<strong>Consultation</strong>',
				variant: 'new',
				element: 'ins',
			},
		] );

		expect( container.querySelector( 'ins strong' ) ).toBeNull();
		expect( container.querySelector( 'ins' ) ).toHaveTextContent( '<strong>Consultation</strong>' );
	} );

	it( 'renders only the server-sanitised preview and never the raw replacement as HTML', () => {
		const { container } = renderCard( [
			{
				tag: 'New',
				text: '<script>window.pwned = true;</script><iframe></iframe><strong onclick="window.pwned = true">raw</strong>',
				previewHtml: '<strong>safe preview</strong>',
				variant: 'new',
				element: 'ins',
			},
		] );

		const ins = container.querySelector( 'ins' );
		expect( ins?.querySelector( 'script' ) ).toBeNull();
		expect( ins?.querySelector( 'iframe' ) ).toBeNull();
		expect( ins?.querySelector( 'strong' ) ).toHaveTextContent( 'safe preview' );
		expect( ins ).not.toHaveTextContent( 'raw' );
		expect( ( window as unknown as { pwned?: boolean } ).pwned ).toBeUndefined();
	} );
} );
