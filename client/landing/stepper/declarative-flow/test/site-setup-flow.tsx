/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import siteSetupFlow from '../flows/site-setup-flow/site-setup-flow';
import { useFlowState } from '../internals/state-manager/store';
import { STEPS } from '../internals/steps';
import { SESSION_KEY_FROM_PLAYGROUND_PUBLISH } from '../internals/steps-repository/playground/lib/constants';
import { getFlowLocation, renderFlow } from './helpers';
// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

// Mock the signup utils
jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupDestinationCookie: jest.fn(),
} ) );
jest.mock( '../internals/state-manager/store', () => ( { useFlowState: jest.fn() } ) );

describe( 'Site Setup Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn(), pathname: '' },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
		jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
		jest.mocked( useFlowState ).mockReturnValue( { get: jest.fn() } );
	} );

	afterEach( () => jest.restoreAllMocks() );

	describe( 'when the current step is importListing', () => {
		it.each(
			[ '', 'https://example.com' ].flatMap( ( from ) =>
				[ false, true ].flatMap( ( fromWpAdmin ) =>
					[ false, true ].map( ( staticImport ) => ( { from, fromWpAdmin, staticImport } ) )
				)
			)
		)(
			'returns WordPress to address entry (source: "$from", wp-admin: $fromWpAdmin, static import: $staticImport)',
			( { from, fromWpAdmin, staticImport } ) => {
				jest
					.mocked( config.isEnabled )
					.mockImplementation(
						( flag ) =>
							flag === 'migration/reprint-flow' ||
							( staticImport && flag === 'migration/non-wordpress-source' )
					);
				const ref = fromWpAdmin ? 'wp-admin-importers-list' : 'new-site-popover';
				jest.mocked( useFlowState ).mockReturnValue( {
					get: () => ( { entryPoint: fromWpAdmin ? ref : undefined } ),
				} );
				const retained = {
					siteId: '123',
					siteSlug: 'example.wordpress.com',
					from,
					ref,
					sessionId: 'fallback-selection',
					source: 'sites-dashboard',
					flags: 'migration/reprint-flow',
					manualPlatform: 'wordpress',
				};
				const stale = {
					manualPlatform: '',
					platform: 'unknown',
					host: 'bluehost',
					isWpcom: 'true',
					ssh: 'true',
					action: 'import',
					how: 'difm',
					start: 'true',
					origin: fromWpAdmin ? '' : STEPS.SITE_MIGRATION_IDENTIFY.slug,
				};
				const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );
				runUseStepNavigationSubmit( {
					currentURL: `/some-path?${ new URLSearchParams( { ...retained, ...stale } ) }`,
					currentStep: STEPS.IMPORT_LIST.slug,
					dependencies: { platform: 'wordpress', url: 'importerWordpress' },
				} );
				const destination = new URL(
					window.location.assign.mock.lastCall[ 0 ],
					'https://example.com'
				);
				expect( destination.pathname ).toBe( '/setup/site-migration/site-migration-identify' );
				expect( Object.fromEntries( destination.searchParams ) ).toEqual( retained );
			}
		);

		it( 'redirects the user to the migration offer when the origin param is set as site-migration-identify', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentURL:
					'/some-path?origin=site-migration-identify&siteSlug=example.wordpress.com&siteId=123',
				currentStep: STEPS.IMPORT_LIST.slug,
				dependencies: {
					platform: 'wordpress',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'/setup/site-migration/site-migration-how-to-migrate?siteSlug=example.wordpress.com&siteId=123'
			);
		} );

		it.each( [ false, true ] )(
			'keeps the file importer without a migration origin (Reprint: %s)',
			( enabled ) => {
				jest.mocked( config.isEnabled ).mockReturnValue( enabled );
				const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

				runUseStepNavigationSubmit( {
					currentStep: STEPS.IMPORT_LIST.slug,
					dependencies: {
						platform: 'wordpress',
						url: 'importerWordpress',
					},
				} );

				expect( window.location.assign ).not.toHaveBeenCalledWith(
					expect.stringContaining( '/setup/site-migration/' )
				);
				expect( getFlowLocation().path ).toBe( '/importerWordpress' );
			}
		);

		it( 'keeps other platforms on their importer with Reprint enabled', () => {
			jest.mocked( config.isEnabled ).mockReturnValue( true );
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );
			runUseStepNavigationSubmit( {
				currentURL: '/some-path?origin=site-migration-identify&siteSlug=example.wordpress.com',
				currentStep: STEPS.IMPORT_LIST.slug,
				dependencies: { platform: 'squarespace', url: 'importerSquarespace' },
			} );
			expect( window.location.assign ).not.toHaveBeenCalled();
			expect( getFlowLocation().path ).toBe(
				'/importerSquarespace?origin=site-migration-identify'
			);
		} );
	} );

	//It is important because importReady and importListing are sharing the same logic
	describe( 'when the current step is not importReady', () => {
		it( 'ignores origin param', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentURL:
					'/some-path?origin=site-migration-identify&siteSlug=example.wordpress.com&siteId=123',
				currentStep: STEPS.IMPORT_READY.slug,
				dependencies: {
					platform: 'wordpress',
					url: 'importerWordpress',
				},
			} );

			expect( window.location.assign ).not.toHaveBeenCalledWith(
				expect.stringContaining( '/setup/site-migration/' )
			);
		} );
	} );

	describe( 'goBack', () => {
		it( 'redirects the user to site-migration flow when clicking back on importList step without backToFlow', () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteSetupFlow );

			runUseStepNavigationGoBack( {
				currentStep: STEPS.IMPORT_LIST.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/setup/site-migration' )
			);
		} );

		it( 'redirects the users to previous FLOW when backToFlow is defined', () => {
			const { runUseStepNavigationGoBack } = renderFlow( siteSetupFlow );

			runUseStepNavigationGoBack( {
				currentURL: '/some-path?backToFlow=some-flow/some-step',
				currentStep: STEPS.IMPORT_LIST.slug,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/setup/some-flow/some-step' )
			);
		} );
	} );

	describe( 'when the Playground import finishes', () => {
		const finishImport = () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.IMPORTER_PLAYGROUND.slug,
				currentURL: `/setup/site-setup/${ STEPS.IMPORTER_PLAYGROUND.slug }?siteSlug=example.wordpress.com&siteId=123`,
				dependencies: { siteSlug: 'example.wordpress.com', siteId: 123 },
			} );
		};

		beforeEach( () => {
			sessionStorage.clear();
		} );

		// Going through exitFlow would replace the Sell intent the Commerce site was created with.
		it( 'leaves a store straight away and clears its session flag', () => {
			sessionStorage.setItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH, '1' );

			finishImport();

			expect( window.location.assign ).toHaveBeenCalledTimes( 1 );
			expect( sessionStorage.getItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH ) ).toBeNull();
			expect( clearSignupDestinationCookie ).not.toHaveBeenCalled();
		} );

		it( 'exits the flow for any other Playground site', () => {
			finishImport();

			expect( window.location.assign ).not.toHaveBeenCalled();
			expect( clearSignupDestinationCookie ).toHaveBeenCalled();
			expect( getFlowLocation().path ).toContain( 'processing' );
		} );
	} );

	describe( 'when finishing the Site Setup Flow', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'exitFlow should clear signup destination cookie', () => {
			const { runUseStepNavigationSubmit } = renderFlow( siteSetupFlow );

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
				dependencies: {
					processingResult: 'success',
				},
			} );

			// Verify the cookie was cleared
			expect( clearSignupDestinationCookie ).toHaveBeenCalled();
		} );
	} );
} );
