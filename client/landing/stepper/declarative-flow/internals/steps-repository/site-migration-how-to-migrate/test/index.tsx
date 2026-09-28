/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import {
	recordMigrationStartEvent,
	recordMigrationStartFacebookEvent,
} from 'calypso/lib/analytics/ad-tracking/record-migration-events';
import SiteMigrationHowToMigrate from '../';
import { defaultSiteDetails } from '../../launchpad/test/lib/fixtures';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const navigation = { submit: jest.fn() };
const mockCancelMigration = jest.fn();
const mockDeleteMigrationSticker = jest.fn();

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

jest.mock( 'calypso/lib/analytics/ad-tracking/record-migration-events' );

jest.mock( 'calypso/data/site-migration/landing/use-migration-cancellation', () => ( {
	useMigrationCancellation: () => ( { mutate: mockCancelMigration } ),
} ) );

jest.mock( 'calypso/data/site-migration/use-migration-sticker', () => ( {
	useMigrationStickerMutation: () => ( { deleteMigrationSticker: mockDeleteMigrationSticker } ),
} ) );

describe( 'SiteMigrationHowToMigrate', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'records migration-start conversions on arrival', () => {
		render( { navigation } );

		expect( recordMigrationStartEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordMigrationStartEvent ).toHaveBeenCalledWith( 'SiteMigrationHowToMigrate' );
		expect( recordMigrationStartFacebookEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordMigrationStartFacebookEvent ).toHaveBeenCalledWith( 'SiteMigrationHowToMigrate' );
	} );

	it.each( [
		[ 'Get started', 'difm', false, 'upgrade' ],
		[ "I'll do it myself", 'myself', false, 'upgrade' ],
		[ 'Get started', 'difm', true, 'migrate' ],
		[ "I'll do it myself", 'myself', true, 'migrate' ],
	] )(
		'submits %s (%s), plugin eligibility %s, destination %s',
		async ( label, how, canInstallPlugins, destination ) => {
			jest.mocked( useSite ).mockReturnValue( {
				...defaultSiteDetails,
				plan: {
					...defaultSiteDetails.plan,
					features: { active: canInstallPlugins ? [ 'install-plugins' ] : [] },
				},
			} );
			render( { navigation } );

			await userEvent.click( screen.getByRole( 'button', { name: label } ) );

			expect( navigation.submit ).toHaveBeenCalledWith( { how, destination } );
			expect( recordMigrationStartEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordMigrationStartFacebookEvent ).toHaveBeenCalledTimes( 1 );
		}
	);

	it.each( [ false, true ] )(
		'offers file import without a plan gate when plugin eligibility is %s',
		async ( canInstallPlugins ) => {
			jest.mocked( useSite ).mockReturnValue( {
				...defaultSiteDetails,
				ID: 123,
				plan: {
					...defaultSiteDetails.plan,
					features: { active: canInstallPlugins ? [ 'install-plugins' ] : [] },
				},
			} );
			render( { navigation } );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Import a WordPress export file' } )
			);

			expect( navigation.submit ).toHaveBeenCalledWith( { destination: 'import' } );
			expect( mockDeleteMigrationSticker ).toHaveBeenCalledWith( 123 );
			expect( mockCancelMigration ).toHaveBeenCalledTimes( 1 );
		}
	);

	it( 'should render proper subheading for free plan', () => {
		const mockSite = {
			...defaultSiteDetails,
		};

		( useSite as jest.Mock ).mockReturnValue( mockSite );

		render( { navigation } );

		expect(
			screen.getByText( /Skip the migration hassle.*without disrupting your current site/i )
		).toBeInTheDocument();
	} );

	it( 'should render proper subheading for Business plan', () => {
		const mockSite = {
			...defaultSiteDetails,
			plan: {
				...defaultSiteDetails.plan,
				product_slug: 'business-bundle',
				features: {
					active: [ 'install-plugins' ],
				},
			},
		};

		( useSite as jest.Mock ).mockReturnValue( mockSite );

		render( { navigation } );

		expect( screen.queryByText( /Plus it's included in your plan/ ) ).toBeInTheDocument();
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
