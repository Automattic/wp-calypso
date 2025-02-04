/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import {
	useContactModalTitleAndSubtitle,
	useContactFormInputHelpText,
	useGetSupportedSMSCountries,
} from '../hooks';

describe( 'useContactModalTitleAndSubtitle', () => {
	it( 'returns correct title and subtitle for email type and add action', () => {
		const { result } = renderHook( () => useContactModalTitleAndSubtitle( 'email', 'add' ) );

		expect( result.current ).toEqual( {
			title: 'Add new email address',
			subtitle: 'Please use an email address that is accessible. Only alerts will be sent.',
		} );
	} );

	it( 'returns correct title and subtitle for email type and edit action', () => {
		const { result } = renderHook( () => useContactModalTitleAndSubtitle( 'email', 'edit' ) );

		expect( result.current ).toEqual( {
			title: 'Edit your email address',
			subtitle: 'If you update your email address, you’ll need to verify it.',
		} );
	} );

	it( 'returns correct title and subtitle for sms type and remove action', () => {
		const { result } = renderHook( () => useContactModalTitleAndSubtitle( 'sms', 'remove' ) );
		expect( result.current ).toEqual( {
			title: 'Remove Phone Number',
			subtitle: 'Are you sure you want to remove this phone number?',
		} );
	} );

	it( 'returns correct title and subtitle for sms type and verify action', () => {
		const { result } = renderHook( () => useContactModalTitleAndSubtitle( 'sms', 'verify' ) );
		expect( result.current ).toEqual( {
			title: 'Verify your phone number',
			subtitle: 'We’ll send a code to verify your phone number.',
		} );
	} );
} );

describe( 'useContactFormInputHelpText', () => {
	it( 'returns correct input help text for email type', () => {
		const { result } = renderHook( () => useContactFormInputHelpText( 'email' ) );

		expect( result.current ).toEqual( {
			name: 'Give this email a nickname for your personal reference.',
			email: 'We’ll send a code to verify your email address.',
			verificationCode: 'Please enter the code you received via email',
		} );
	} );

	it( 'returns correct input help text for sms type', () => {
		const { result } = renderHook( () => useContactFormInputHelpText( 'sms' ) );

		expect( result.current ).toEqual( {
			name: 'Give this number a nickname for your personal reference.',
			phoneNumber: 'We’ll send a code to verify your phone number.',
			verificationCode: 'Please enter the code you received via SMS',
		} );
	} );
} );

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: jest.fn( () => ( { data: { country_short: 'US' } } ) ),
} ) );

describe( 'useGetSupportedSMSCountries', () => {
	it( 'returns supported SMS countries with user country at the top', () => {
		const countries = [
			{ code: 'US', name: 'United States' },
			{ code: 'CA', name: 'Canada' },
		];

		// Mock the useSelector function to return the countries
		jest.spyOn( require( 'calypso/state' ), 'useSelector' ).mockReturnValue( countries );

		const { result } = renderHook( () => useGetSupportedSMSCountries() );

		expect( result.current ).toEqual( countries );
	} );
} );
