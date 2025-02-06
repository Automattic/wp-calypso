/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationHowToMigrate from '../';
import { defaultSiteDetails } from '../../launchpad/test/lib/fixtures';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const navigation = { submit: jest.fn() };

type Props = ComponentProps< typeof SiteMigrationHowToMigrate >;

const render = ( props?: Partial< Props >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ), stepName: 'site-migration-how-to-migrate' };

	return renderStep( <SiteMigrationHowToMigrate { ...combinedProps } />, renderOptions );
};

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: jest.fn(),
} ) );

jest.mock( 'calypso/lib/presales-chat', () => ( {
	usePresalesChat: () => {},
} ) );

describe( 'SiteMigrationHowToMigrate', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render proper subheading for free plan', () => {
		const mockSite = {
			...defaultSiteDetails,
		};

		( useSite as jest.Mock ).mockReturnValue( mockSite );

		render( { navigation } );

		expect( screen.queryByText( /Plus you get 50% off our annual/ ) ).toBeInTheDocument();
	} );

	it( 'should render proper subheading for Business plan', () => {
		const mockSite = {
			...defaultSiteDetails,
			plan: {
				...defaultSiteDetails.plan,
				product_slug: 'business-bundle',
			},
		};

		( useSite as jest.Mock ).mockReturnValue( mockSite );

		render( { navigation } );

		expect( screen.queryByText( /Plus it’s included in your/ ) ).toBeInTheDocument();
	} );

	it( 'should render step content', () => {
		render( { navigation } );

		expect( screen.queryByText( /How it works/ ) ).toBeInTheDocument();
	} );

	it( 'should render <DIYOption /> component', () => {
		render( { navigation } );

		expect( screen.queryByText( /I'll do it myself/ ) ).toBeInTheDocument();
	} );
} );
