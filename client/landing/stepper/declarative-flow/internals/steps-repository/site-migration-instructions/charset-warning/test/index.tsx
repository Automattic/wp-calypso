/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { CharsetWarning } from '../index';

describe( 'CharsetWarning', () => {
	it( 'should render nothing when dbCharset is not latin1', () => {
		const { container } = render( <CharsetWarning dbCharset="utf8" /> );
		expect( container.firstChild ).toBeNull();
	} );

	it( 'should render nothing when dbCharset is undefined', () => {
		const { container } = render( <CharsetWarning dbCharset={ undefined } /> );
		expect( container.firstChild ).toBeNull();
	} );

	it( 'should render warning when dbCharset is latin1', () => {
		const { getByText } = render( <CharsetWarning dbCharset="latin1" /> );
		expect( getByText( /Heads up!/i ) ).toBeVisible();
	} );

	it( 'should render warning when dbCharset is LATIN1 (case insensitive)', () => {
		const { getByText } = render( <CharsetWarning dbCharset="LATIN1" /> );
		expect( getByText( /Heads up!/i ) ).toBeVisible();
	} );

	it( 'should contain links to support and codex', () => {
		const { getByRole } = render( <CharsetWarning dbCharset="latin1" /> );
		const supportLink = getByRole( 'link', { name: /contact support/i } );
		const codexLink = getByRole( 'link', { name: /convert your source site to Latin1/i } );

		expect( supportLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'wordpress.com/support/help-support-options' )
		);
		expect( codexLink ).toHaveAttribute(
			'href',
			expect.stringContaining( 'codex.wordpress.org/Converting_Database_Character_Sets' )
		);
	} );
} );
