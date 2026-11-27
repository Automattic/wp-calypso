/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import transferringHostedSite from '../flows/transferring-hosted-site-flow/transferring-hosted-site-flow';
import { ProcessingResult } from '../internals/steps-repository/processing-step/constants';
import { getFlowLocation, renderFlow } from './helpers';

// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;
let mockIsAdminInterfaceWPAdminMock = true;
const mockSiteId = 123;
const mockSite = {
	ID: mockSiteId,
	URL: 'https://mysite.com',
	options: {
		admin_url: 'https://mysite.com/wp-admin',
	},
};

vi.mock( 'calypso/state/sites/selectors', () => ( {
	isAdminInterfaceWPAdmin: vi.fn( () => mockIsAdminInterfaceWPAdminMock ),
} ) );
vi.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: vi.fn( ( path: string ) => `https://my.wordpress.com${ path }` ),
} ) );
vi.mock( '../../hooks/use-site', () => ( {
	useSite: vi.fn( () => mockSite ),
} ) );

vi.mock( '@wordpress/data', async () => {
	const actualModule =
		await vi.importActual< typeof import( '@wordpress/data' ) >( '@wordpress/data' );

	return new Proxy( actualModule, {
		get: ( target, property ) => {
			switch ( property ) {
				case 'useSelect': {
					return vi.fn( () => {
						return {
							options: {
								admin_url: 'https://mysite.com/wp-admin',
							},
						};
					} );
				}
				// fallback to the original module
				default: {
					return target[ property ];
				}
			}
		},
	} );
} );

describe( 'Transferring hosted site flow submit redirects', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: vi.fn() },
		} );
	} );

	describe( 'navigation', () => {
		const { runUseStepNavigationSubmit } = renderFlow( transferringHostedSite );

		it( 'redirects the user to the wp-admin when isAdminInterfaceWPAdmin', async () => {
			runUseStepNavigationSubmit( {
				currentURL: '/setup/site-migration',
				currentStep: 'processing',
				dependencies: {
					action: 'continue',
					platform: 'wordpress',
					from: 'https://site-to-be-migrated.com',
				},
			} );

			await waitFor( () => {
				expect( getFlowLocation() ).toEqual( {
					path: '/setup/site-migration',
					state: null,
				} );
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( 'https://mysite.com/wp-admin' );
		} );

		it( 'redirects the user to the dashboard when is not wp-admin', async () => {
			mockIsAdminInterfaceWPAdminMock = false;

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				'https://my.wordpress.com/sites/mysite.com'
			);
		} );

		it( 'returns to the wait when a reload left nothing to process', async () => {
			mockIsAdminInterfaceWPAdminMock = false;
			window.location.assign.mockClear();

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
				dependencies: {
					processingResult: ProcessingResult.NO_ACTION,
				},
			} );

			await waitFor( () => {
				expect( getFlowLocation().path ).toBe( '/waitForAtomic' );
			} );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'redirects the user to the redirectTo when it is provided', async () => {
			mockIsAdminInterfaceWPAdminMock = false;

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
				dependencies: {
					redirectTo: '/redirect-to-some-page',
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/redirect-to-some-page' );
		} );
	} );
} );
