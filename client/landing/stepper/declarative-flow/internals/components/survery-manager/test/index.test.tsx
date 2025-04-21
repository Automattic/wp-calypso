/**
 * @jest-environment jsdom
 */

import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { SITE_MIGRATION_FLOW, HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import SurveyManager from '../';
import { type Flow } from '../../../types';

// Mock the dependencies
jest.mock( '@automattic/i18n-utils', () => ( {
	useIsEnglishLocale: jest.fn(),
} ) );

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: jest.fn(),
} ) );

jest.mock( '../../../steps-repository/components/migration-survey/async', () => {
	const AsyncMigrationSurvey = ( { countryCode }: { countryCode: string } ) => (
		<div data-testid="mock-survey">Mock Survey for { countryCode }</div>
	);

	return AsyncMigrationSurvey;
} );

jest.mock( '../../deferred-render', () => {
	const DeferredRender = ( { children }: { children: React.ReactNode; timeMs?: number } ) =>
		children;

	return { DeferredRender };
} );

// Mock flow type for testing
const mockFlow: Flow = {
	name: SITE_MIGRATION_FLOW,
	isSignupFlow: true,
	initialize: jest.fn(),
	useStepNavigation: jest.fn(),
};

describe( 'SurveyManager', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( true );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: { country_short: 'US' },
		} );
	} );

	it( 'should render null when disabled prop is true', () => {
		const { container } = render( <SurveyManager disabled flow={ mockFlow } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null when no flow is provided', () => {
		const { container } = render( <SurveyManager /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null when no country code is available', () => {
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( { data: null } );
		const { container } = render( <SurveyManager flow={ mockFlow } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null for non-migration flows', () => {
		const nonMigrationFlow: Flow = {
			...mockFlow,
			name: 'other-flow',
		};
		const { container } = render( <SurveyManager flow={ nonMigrationFlow } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null for non-supported countries', () => {
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: { country_short: 'FR' },
		} );
		const { container } = render( <SurveyManager flow={ mockFlow } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null for non-English locales', () => {
		( useIsEnglishLocale as jest.Mock ).mockReturnValue( false );
		const { container } = render( <SurveyManager flow={ mockFlow } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	describe.each( [ SITE_MIGRATION_FLOW, HOSTED_SITE_MIGRATION_FLOW ] )(
		'Flow: %s',
		( flowName ) => {
			it( 'should render survey when all conditions are met', () => {
				const testFlow: Flow = {
					...mockFlow,
					name: flowName,
				};
				render( <SurveyManager flow={ testFlow } /> );
				expect( screen.getByTestId( 'mock-survey' ) ).toBeInTheDocument();
				expect( screen.getByText( 'Mock Survey for US' ) ).toBeInTheDocument();
			} );
		}
	);
} );
