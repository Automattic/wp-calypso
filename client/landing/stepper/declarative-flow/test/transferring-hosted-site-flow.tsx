/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { waitFor } from '@testing-library/react';
import transferringHostedSite from '../flows/transferring-hosted-site-flow/transferring-hosted-site-flow';
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

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isAdminInterfaceWPAdmin: jest.fn( () => mockIsAdminInterfaceWPAdminMock ),
} ) );
jest.mock( '../../hooks/use-site', () => ( {
	useSite: jest.fn( () => mockSite ),
} ) );

jest.mock( '@wordpress/data', () => {
	const actualModule = jest.requireActual( '@wordpress/data' );

	return new Proxy( actualModule, {
		get: ( target, property ) => {
			switch ( property ) {
				case 'useSelect': {
					return jest.fn( () => {
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
			value: { ...originalLocation, assign: jest.fn() },
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

		it( 'redirects the user to the /home when is not wp-admin', async () => {
			mockIsAdminInterfaceWPAdminMock = false;

			runUseStepNavigationSubmit( {
				currentStep: 'processing',
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/home/' + mockSiteId );
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
