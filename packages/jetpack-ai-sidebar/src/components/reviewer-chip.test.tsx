/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ReviewerChip from './reviewer-chip';

// JSDOM's CSSOM normalizes `hsla()` inline styles into an rgba token that
// strips the hue, so `style.background` comparisons don't round-trip. Read
// the raw `style=""` attribute on the rendered element to assert on the
// literal `hsla(...)` string we emitted.
function getRawStyle( el: Element ): string {
	return el.getAttribute( 'style' ) ?? '';
}

describe( 'ReviewerChip', () => {
	it( 'renders an <img> when avatar_url is safe', () => {
		const { container } = render(
			<ReviewerChip
				name="Marcus Holloway"
				metadata={ { avatar_url: 'https://secure.gravatar.com/avatar/example' } }
			/>
		);
		// `alt=""` demotes role to "presentation"; query by selector instead.
		const img = container.querySelector( 'img' ) as HTMLImageElement;
		expect( img ).not.toBeNull();
		expect( img.getAttribute( 'src' ) ).toBe( 'https://secure.gravatar.com/avatar/example' );
		expect( screen.getByText( 'Marcus Holloway' ) ).toBeInTheDocument();
	} );

	it( 'promotes Automattic avatar URLs to HTTPS before rendering', () => {
		const { container } = render(
			<ReviewerChip
				name="Priya Desai"
				metadata={ { avatar_url: 'http://files.wordpress.com/avatar.png' } }
			/>
		);

		const img = container.querySelector( 'img' ) as HTMLImageElement;
		expect( img ).not.toBeNull();
		expect( img.getAttribute( 'src' ) ).toBe( 'https://files.wordpress.com/avatar.png' );
	} );

	it( 'proxies external avatar URLs before rendering', () => {
		const { container } = render(
			<ReviewerChip
				name="Priya Desai"
				metadata={ { avatar_url: 'https://example.test/avatar.png' } }
			/>
		);

		const img = container.querySelector( 'img' ) as HTMLImageElement;
		expect( img ).not.toBeNull();
		expect( img.getAttribute( 'src' ) ).toBe( 'https://i0.wp.com/example.test/avatar.png?ssl=1' );
	} );

	it( 'falls back to pill when avatar_url cannot be made safe', () => {
		const { container } = render(
			<ReviewerChip
				name="Priya Desai"
				metadata={ { avatar_url: 'https://example.test/avatar.png?token=abc123' } }
			/>
		);

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '.jetpack-ai-reviewer-chip.is-pill' ) ).not.toBeNull();
	} );

	it( 'renders the full name in a coloured pill when no avatar_url', () => {
		const { container } = render( <ReviewerChip name="Marcus Holloway" /> );
		const pill = container.querySelector( '.jetpack-ai-reviewer-chip.is-pill' );
		expect( pill ).not.toBeNull();
		expect( pill?.textContent ).toBe( 'Marcus Holloway' );
		// Inline background is driven by the hash → HSL.
		expect( getRawStyle( pill as Element ) ).toMatch( /hsla\(/ );
	} );

	it( 'produces the same background colour for the same name on every render', () => {
		const { container: a } = render( <ReviewerChip name="Marcus Holloway" /> );
		const { container: b } = render( <ReviewerChip name="Marcus Holloway" /> );
		const styleA = getRawStyle( a.querySelector( '.jetpack-ai-reviewer-chip' ) as Element );
		const styleB = getRawStyle( b.querySelector( '.jetpack-ai-reviewer-chip' ) as Element );
		expect( styleA ).toBe( styleB );
	} );

	it( 'produces different background colours for different names', () => {
		const { container: a } = render( <ReviewerChip name="Marcus Holloway" /> );
		const { container: b } = render( <ReviewerChip name="Priya Desai" /> );
		const styleA = getRawStyle( a.querySelector( '.jetpack-ai-reviewer-chip' ) as Element );
		const styleB = getRawStyle( b.querySelector( '.jetpack-ai-reviewer-chip' ) as Element );
		expect( styleA ).not.toBe( styleB );
	} );

	it( 'falls back to pill when metadata.avatar_url is null', () => {
		const { container } = render(
			<ReviewerChip name="Priya Desai" metadata={ { avatar_url: null } } />
		);
		expect( container.querySelector( '.jetpack-ai-reviewer-chip.is-pill' ) ).not.toBeNull();
	} );
} );
