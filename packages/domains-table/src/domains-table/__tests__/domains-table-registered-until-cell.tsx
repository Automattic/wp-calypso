/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider, testPartialDomain } from '../../test-utils';
import { DomainsTableRegisteredUntilCell } from '../domains-table-registered-until-cell';

describe( 'DomainsTable registered until cell', () => {
	let dateTimeFormatSpy;

	beforeAll( () => {
		const OriginalTimeFormat = Intl.DateTimeFormat;
		dateTimeFormatSpy = jest.spyOn( global.Intl, 'DateTimeFormat' );
		dateTimeFormatSpy.mockImplementation(
			( locale, options ) => new OriginalTimeFormat( locale, { ...options, timeZone: 'UTC' } )
		);
	} );

	afterAll( () => {
		dateTimeFormatSpy.mockClear();
	} );

	test( 'when a domain is registered, display its expiration date', () => {
		const partialDomain = testPartialDomain( {
			domain: 'example.com',
			blog_id: 123,
			wpcom_domain: false,
			has_registration: true,
			expiry: '2024-08-01T00:00:00+00:00',
		} );

		renderWithProvider( <DomainsTableRegisteredUntilCell domain={ partialDomain } /> );

		expect( screen.getByText( 'Aug 1, 2024' ) ).toBeInTheDocument();
	} );

	test( 'when its not a registered domain, do not display an expiration date', () => {
		const partialDomain = testPartialDomain( {
			domain: 'example.wordpress.com',
			blog_id: 123,
			wpcom_domain: true,
			has_registration: false,
		} );

		renderWithProvider( <DomainsTableRegisteredUntilCell domain={ partialDomain } /> );

		expect( screen.getByText( '-' ) ).toBeInTheDocument();
	} );
} );
