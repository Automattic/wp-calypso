/**
 * @jest-environment jsdom
 */

import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { render } from '@testing-library/react';
import React from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import MigrationSurvey from '../';

// Mock dependencies
jest.mock( '@automattic/i18n-utils', () => ( {
	useIsEnglishLocale: jest.fn(),
} ) );

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: jest.fn(),
} ) );

describe( 'MigrationSurvey', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render null when not in English locale', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( false );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: { country_short: 'US' } } );

		const { container } = render( <MigrationSurvey /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null when country is not supported', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( true );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: { country_short: 'FR' } } );

		const { container } = render( <MigrationSurvey /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null when country is not initialized', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( true );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: undefined } );

		const { container } = render( <MigrationSurvey /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render survey for US users in English locale', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( true );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: { country_short: 'US' } } );

		const { getByRole } = render( <MigrationSurvey /> );

		expect( getByRole( 'link', { name: 'Take survey' } ) ).toHaveAttribute(
			'href',
			'https://automattic.survey.fm/wp-com-migration-survey-wtp-us-focused'
		);
	} );

	it( 'should render survey for India users in English locale', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( true );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: { country_short: 'IN' } } );

		const { getByRole } = render( <MigrationSurvey /> );

		expect( getByRole( 'link', { name: 'Take survey' } ) ).toHaveAttribute(
			'href',
			'https://automattic.survey.fm/wp-com-migration-survey-wtp-india-focused'
		);
	} );
} );
