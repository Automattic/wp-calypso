/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import { ComponentProps } from 'react';
import { vi } from 'vitest';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	recordMigrationStartEvent,
	recordMigrationStartFacebookEvent,
} from 'calypso/lib/analytics/ad-tracking/record-migration-events';
import { requestSite } from 'calypso/state/sites/actions';
import SiteMigrationHowToMigrate from '../';
import { defaultSiteDetails } from '../../launchpad/test/lib/fixtures';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const navigation = { submit: vi.fn(), goBack: vi.fn() };
const mockCancelMigration = vi.fn();
const mockDeleteMigrationSticker = vi.fn();

type Props = ComponentProps< typeof SiteMigrationHowToMigrate >;

const render = ( props?: Partial< Props >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ), stepName: 'site-migration-how-to-migrate' };

	return renderStep( <SiteMigrationHowToMigrate { ...combinedProps } />, renderOptions );
};

vi.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: vi.fn(),
} ) );

vi.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: vi.fn(),
	canAccessWpcomApis: vi.fn( () => true ),
} ) );

vi.mock( 'calypso/lib/analytics/ad-tracking/record-migration-events' );

vi.mock( 'calypso/data/site-migration/landing/use-migration-cancellation', () => ( {
	useMigrationCancellation: () => ( { mutate: mockCancelMigration } ),
} ) );

vi.mock( 'calypso/data/site-migration/use-migration-sticker', () => ( {
	useMigrationStickerMutation: () => ( { deleteMigrationSticker: mockDeleteMigrationSticker } ),
} ) );

const setSite = ( site ) => {
	act( () => {
		if ( site ) {
			dispatch( SITE_STORE ).receiveSite( 123, { ...site, ID: 123 } );
			dispatch( SITE_STORE ).finishResolution( 'getSite', [ '123' ] );
		} else {
			dispatch( SITE_STORE ).reset();
			dispatch( SITE_STORE ).invalidateResolutionForStore();
		}
	} );
};

describe( 'SiteMigrationHowToMigrate', () => {
	beforeEach( () => {
		vi.mocked( requestSite ).mockImplementation( () => vi.fn() );
		dispatch( SITE_STORE ).reset();
		dispatch( SITE_STORE ).invalidateResolutionForStore();
		vi.mocked( wpcomRequest ).mockResolvedValue( undefined );
		setSite( defaultSiteDetails );
	} );

	afterEach( () => {
		vi.resetAllMocks();
		vi.restoreAllMocks();
	} );

	it.each( [ 0, 1 ] )(
		'cancels and uses browser Back without a navigation handler at history index %i',
		async ( idx ) => {
			vi.spyOn( history, 'state', 'get' ).mockReturnValue( { idx } );
			const back = vi.spyOn( history, 'back' ).mockImplementation( () => {} );
			render( { navigation: { submit: navigation.submit } } );

			await userEvent.click( screen.getByRole( 'button', { name: /Back/ } ) );

			expect( mockCancelMigration ).toHaveBeenCalledTimes( 1 );
			expect( back ).toHaveBeenCalledTimes( 1 );
		}
	);

	it( 'records migration-start conversions on arrival', () => {
		render( { navigation } );

		expect( recordMigrationStartEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordMigrationStartEvent ).toHaveBeenCalledWith( 'SiteMigrationHowToMigrate' );
		expect( recordMigrationStartFacebookEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordMigrationStartFacebookEvent ).toHaveBeenCalledWith( 'SiteMigrationHowToMigrate' );
	} );

	it.each( [
		[ '/some-path?siteId=123&siteSlug=destination.wordpress.com', '123' ],
		[ '/some-path?siteSlug=destination.wordpress.com', 'destination.wordpress.com' ],
	] )( 'recovers from a failed destination lookup at %s', async ( initialEntry, destination ) => {
		const destinationSite = {
			...defaultSiteDetails,
			ID: 123,
			URL: 'https://destination.wordpress.com',
			plan: {
				...defaultSiteDetails.plan,
				product_slug: 'business-bundle',
				features: { active: [ 'install-plugins' ] },
			},
		};
		setSite( null );
		let resolveRetry;
		const retryResponse = new Promise( ( resolve ) => {
			resolveRetry = resolve;
		} );
		vi.mocked( wpcomRequest )
			.mockRejectedValueOnce( { error: 'http_request_failed', message: 'Request failed' } )
			.mockReturnValueOnce( retryResponse );
		render( { navigation }, { initialEntry } );

		expect(
			await screen.findByRole( 'heading', { name: "We couldn't load your site" } )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Get started' } ) ).not.toBeInTheDocument();
		expect( navigation.submit ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		await waitFor( () => expect( wpcomRequest ).toHaveBeenCalledTimes( 2 ) );
		expect(
			screen.queryByRole( 'heading', { name: "We couldn't load your site" } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Get started' } ) ).not.toBeInTheDocument();
		expect( navigation.submit ).not.toHaveBeenCalled();
		expect( wpcomRequest ).toHaveBeenLastCalledWith( {
			path: `/sites/${ destination }`,
			apiVersion: '1.1',
			query: 'force=wpcom',
		} );

		await act( async () => resolveRetry( destinationSite ) );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Get started' } ) );
		expect( navigation.submit ).toHaveBeenCalledWith( { how: 'difm', destination: 'migrate' } );
	} );

	it( 'ignores lookup failures for another destination while this site is loading', () => {
		setSite( null );
		dispatch( SITE_STORE ).receiveSiteFailed( 456, {
			error: 'unknown_blog',
			message: 'Unknown blog',
		} );
		dispatch( SITE_STORE ).finishResolution( 'getSite', [ '456' ] );
		render( { navigation } );

		expect(
			screen.queryByRole( 'heading', { name: "We couldn't load your site" } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Get started' } ) ).not.toBeInTheDocument();
		expect( navigation.submit ).not.toHaveBeenCalled();
	} );

	it( 'offers a way back when the destination lookup fails without cancelling a migration', async () => {
		setSite( null );
		vi.mocked( wpcomRequest ).mockRejectedValue( {
			error: 'http_request_failed',
			message: 'Request failed',
		} );
		render( { navigation } );
		await screen.findByRole( 'heading', { name: "We couldn't load your site" } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );

		expect( navigation.goBack ).toHaveBeenCalledTimes( 1 );
		expect( mockCancelMigration ).not.toHaveBeenCalled();
		expect( navigation.submit ).not.toHaveBeenCalled();
	} );

	it( 'offers a way back instead of loading indefinitely when the destination is missing', async () => {
		setSite( null );
		render( { navigation }, { initialEntry: '/some-path' } );

		expect( screen.getByRole( 'heading', { name: "We couldn't load your site" } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( navigation.goBack ).toHaveBeenCalledTimes( 1 );
		expect( navigation.submit ).not.toHaveBeenCalled();
	} );

	it.each( [ '/some-path?siteId=123', '/some-path' ] )(
		'uses browser Back without cancelling when the destination is unavailable at %s',
		async ( initialEntry ) => {
			setSite( null );
			vi.mocked( wpcomRequest ).mockRejectedValue( {
				error: 'http_request_failed',
				message: 'Request failed',
			} );
			const back = vi.spyOn( history, 'back' ).mockImplementation( () => {} );
			render( { navigation: { submit: navigation.submit } }, { initialEntry } );
			await screen.findByRole( 'heading', { name: "We couldn't load your site" } );

			await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );

			expect( back ).toHaveBeenCalledTimes( 1 );
			expect( mockCancelMigration ).not.toHaveBeenCalled();
			expect( navigation.submit ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ 'Get started', 'difm' ],
		[ "I'll do it myself", 'myself' ],
	] )( 'waits for the destination before allowing %s', async ( label, how ) => {
		setSite( null );
		render( { navigation } );

		expect( screen.queryByRole( 'button', { name: 'Get started' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: "I'll do it myself" } ) ).not.toBeInTheDocument();
		expect( navigation.submit ).not.toHaveBeenCalled();

		setSite( {
			...defaultSiteDetails,
			plan: {
				...defaultSiteDetails.plan,
				product_slug: 'business-bundle',
				features: { active: [ 'install-plugins' ] },
			},
		} );

		const button = screen.getByRole( 'button', { name: label } );
		expect( button ).toBeVisible();
		await userEvent.click( button );

		expect( navigation.submit ).toHaveBeenCalledWith( { how, destination: 'migrate' } );
	} );

	it.each( [
		[ 'Get started', 'difm', false, 'upgrade' ],
		[ "I'll do it myself", 'myself', false, 'upgrade' ],
		[ 'Get started', 'difm', true, 'migrate' ],
		[ "I'll do it myself", 'myself', true, 'migrate' ],
	] )(
		'submits %s (%s), plugin eligibility %s, destination %s',
		async ( label, how, canInstallPlugins, destination ) => {
			setSite( {
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
			setSite( {
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

		setSite( mockSite );

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

		setSite( mockSite );

		render( { navigation } );

		expect( screen.queryByText( /Plus it's included in your plan/ ) ).toBeInTheDocument();
	} );

	it( 'should render step content', () => {
		render( { navigation } );

		expect( screen.queryByText( /How it works/ ) ).toBeInTheDocument();
	} );

	it( 'should render the "I\'ll do it myself" option', () => {
		render( { navigation } );

		expect( screen.queryByText( /I'll do it myself/ ) ).toBeInTheDocument();
	} );
} );
