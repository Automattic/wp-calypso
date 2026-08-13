/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { FreshlyPressedBadge, getFreshlyPressedOn } from '../freshly-pressed-badge';

describe( 'getFreshlyPressedOn', () => {
	const displayedOn = '2026-08-11T12:00:00+00:00';
	const post = { editorial: { displayed_on: displayedOn } };

	it( 'returns displayed_on on the Freshly Pressed Discover stream', () => {
		expect( getFreshlyPressedOn( 'discover:freshly-pressed', post ) ).toBe( displayedOn );
	} );

	it( 'returns undefined on other streams even when editorial is present', () => {
		expect( getFreshlyPressedOn( 'discover:recommended', post ) ).toBeUndefined();
		expect( getFreshlyPressedOn( 'following', post ) ).toBeUndefined();
		expect( getFreshlyPressedOn( undefined, post ) ).toBeUndefined();
	} );

	it( 'returns undefined when displayed_on is missing or empty', () => {
		expect( getFreshlyPressedOn( 'discover:freshly-pressed', {} ) ).toBeUndefined();
		expect(
			getFreshlyPressedOn( 'discover:freshly-pressed', { editorial: { displayed_on: '' } } )
		).toBeUndefined();
	} );
} );

describe( 'FreshlyPressedBadge', () => {
	it( 'renders an absolute Freshly Pressed date', () => {
		render( <FreshlyPressedBadge displayedOn="2026-08-11T12:00:00+00:00" /> );

		expect( screen.getByText( /Freshly Pressed on .+2026/i ) ).toBeVisible();
	} );

	it( 'renders nothing for an invalid date', () => {
		const { container } = render( <FreshlyPressedBadge displayedOn="not-a-date" /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
