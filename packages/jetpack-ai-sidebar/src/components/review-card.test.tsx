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
	return {
		BlockIcon: () => react.createElement( 'span', { 'data-testid': 'block-icon' } ),
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

describe( 'ReviewCard HTML rows', () => {
	it( 'renders inline formatting as elements instead of literal tags', () => {
		const { container } = renderCard( [
			{
				tag: 'Current',
				text: '<strong>Consultation</strong> opens on next week.',
				variant: 'current',
				element: 'del',
				contentFormat: 'html',
			},
			{
				tag: 'New',
				text: '<strong>Consultation</strong> <em>opens</em> on 1 May.',
				variant: 'new',
				element: 'ins',
				contentFormat: 'html',
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
				variant: 'new',
				element: 'ins',
				contentFormat: 'html',
			},
		] );

		expect( container.querySelector( 'ins' )?.textContent ).toBe( 'Fees & charges' );
	} );

	it( 'renders an HTML Suggestion text row with formatting', () => {
		const { container } = renderCard( [
			{
				tag: 'Suggestion',
				text: 'Use <strong>bold</strong> sparingly.',
				variant: 'new',
				element: 'text',
				contentFormat: 'html',
			},
		] );

		const text = container.querySelector( '.jetpack-ai-feedback-list__diff-text' );
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
				contentFormat: 'text',
			},
		] );

		expect( screen.getByText( 'Change the <h3> to an <h2>.' ) ).toBeInTheDocument();
	} );

	it( 'fails closed to literal text for an unknown runtime content format', () => {
		const row = {
			tag: 'New',
			text: '<strong>Consultation</strong>',
			variant: 'new',
			element: 'ins',
			contentFormat: 'markdown',
		} as unknown as ReviewCardRow;
		const { container } = renderCard( [ row ] );

		expect( container.querySelector( 'ins strong' ) ).toBeNull();
		expect( container.querySelector( 'ins' ) ).toHaveTextContent( '<strong>Consultation</strong>' );
	} );

	it( 'sanitizes scripts and event handlers out of HTML rows', () => {
		const { container } = renderCard( [
			{
				tag: 'New',
				text: 'safe<script>window.pwned = true;</script><strong onclick="window.pwned = true">format</strong>',
				variant: 'new',
				element: 'ins',
				contentFormat: 'html',
			},
		] );

		const ins = container.querySelector( 'ins' );
		expect( ins?.querySelector( 'script' ) ).toBeNull();
		expect( ins?.textContent ).toBe( 'safeformat' );
		const strong = ins?.querySelector( 'strong' );
		expect( strong ).not.toBeNull();
		expect( strong?.getAttribute( 'onclick' ) ).toBeNull();
		expect( ( window as unknown as { pwned?: boolean } ).pwned ).toBeUndefined();
	} );
} );
