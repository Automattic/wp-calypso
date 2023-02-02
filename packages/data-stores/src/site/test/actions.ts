/**
 * @jest-environment jsdom
 */

import { createActions } from '../actions';
import {
	SiteLaunchError,
	AtomicTransferError,
	LatestAtomicTransfer,
	LatestAtomicTransferError,
	AtomicSoftwareStatus,
} from '../types';

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';
const mockedClientCredentials = { client_id, client_secret };
const siteId = 12345;
const error = SiteLaunchError.INTERNAL;
const atomicTransferError = AtomicTransferError.INTERNAL;
const latestAtomicTransferError: LatestAtomicTransferError = {
	name: 'NotFoundError',
	status: 404,
	message: 'Transfer not found',
	code: 'no_transfer_error',
};

const siteSlug = 'test.wordpress.com';
const pluginSlug = 'woocommerce';

describe( 'Site Actions', () => {
	describe( 'Bundled Plugin Actions', () => {
		it( 'should return a SET_BUNDLED_PLUGIN_SLUG Action', () => {
			const { setBundledPluginSlug } = createActions( mockedClientCredentials );
			const expected = {
				type: 'SET_BUNDLED_PLUGIN_SLUG',
				siteSlug,
				pluginSlug,
			};

			expect( setBundledPluginSlug( siteSlug, pluginSlug ) ).toEqual( expected );
		} );
	} );
	describe( 'LAUNCH_SITE Actions', () => {
		it( 'should return a LAUNCH_SITE_START Action', () => {
			const { launchSiteStart } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_START',
				siteId,
			};

			expect( launchSiteStart( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_SUCCESS Action', () => {
			const { launchSiteSuccess } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			};

			expect( launchSiteSuccess( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_FAILURE Action', () => {
			const { launchSiteFailure } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			};

			expect( launchSiteFailure( siteId, error ) ).toEqual( expected );
		} );

		it( 'should launch a site successfully', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LAUNCH_SITE_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			} );
		} );

		it( 'should fail to launch a site', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: Throw an error
			expect( generator.throw( error ).value ).toEqual( {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			} );

			// Fourth iteration: Complete the cycle
			const finalResult = generator.next();

			expect( finalResult.value ).toBeFalsy();
			expect( finalResult.done ).toBe( true );
		} );
	} );

	describe( 'Atomic Actions', () => {
		it( 'should return a ATOMIC_TRANSFER_START Action', () => {
			const { atomicTransferStart } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			};

			expect( atomicTransferStart( siteId, softwareSet ) ).toEqual( expected );
		} );

		it( 'should return a ATOMIC_TRANSFER_SUCCESS Action', () => {
			const { atomicTransferSuccess } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_SUCCESS',
				siteId,
				softwareSet,
			};

			expect( atomicTransferSuccess( siteId, softwareSet ) ).toEqual( expected );
		} );

		it( 'should return a ATOMIC_TRANSFER_FAILURE Action', () => {
			const { atomicTransferFailure } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_FAILURE',
				siteId,
				softwareSet,
				error: atomicTransferError,
			};

			expect( atomicTransferFailure( siteId, softwareSet, atomicTransferError ) ).toEqual(
				expected
			);
		} );

		it( 'should start an Atomic transfer', () => {
			const { initiateAtomicTransfer } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateAtomicTransfer( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/transfers`,
					body: { software_set: softwareSet },
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_SUCCESS',
				siteId,
				softwareSet,
			} );
		} );
		it( 'should fail to transfer a site to Atomic', () => {
			const { initiateAtomicTransfer } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateAtomicTransfer( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/transfers`,
					body: { software_set: softwareSet },
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_FAILURE is fired
			expect( generator.throw( atomicTransferError ).value ).toEqual( {
				type: 'ATOMIC_TRANSFER_FAILURE',
				siteId,
				softwareSet,
				error: atomicTransferError,
			} );
		} );

		it( 'should request succesfully the Atomic transfer status', () => {
			const { requestLatestAtomicTransfer } = createActions( mockedClientCredentials );
			const generator = requestLatestAtomicTransfer( siteId );
			const transfer: LatestAtomicTransfer = {
				atomic_transfer_id: 123,
				blog_id: 12345,
				status: 'SUCCESS',
				created_at: 'now',
				is_stuck: false,
				is_stuck_reset: false,
				in_lossless_revert: false,
			};

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/transfers/latest`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LATEST_ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next( transfer ).value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_SUCCESS',
				siteId,
				transfer,
			} );
		} );

		it( 'should request the Atomic transfer status and fail', () => {
			const { requestLatestAtomicTransfer } = createActions( mockedClientCredentials );
			const generator = requestLatestAtomicTransfer( siteId );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/transfers/latest`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LATEST_ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LATEST_ATOMIC_TRANSFER_FAILURE is fired
			expect( generator.throw( latestAtomicTransferError ).value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_FAILURE',
				siteId,
				error: latestAtomicTransferError,
			} );
		} );

		it( 'should request the Atomic software install status succesfully', () => {
			const { requestAtomicSoftwareStatus } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = requestAtomicSoftwareStatus( siteId, softwareSet );
			const status: AtomicSoftwareStatus = {
				blog_id: 123,
				software_set: {
					test: { path: '/valid_path.php', state: 'activate' },
				},
				applied: false,
			};

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_STATUS_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LATEST_ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next( status ).value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_STATUS_SUCCESS',
				siteId,
				softwareSet,
				status,
			} );
		} );
		it( 'should start an Atomic software install', () => {
			const { initiateSoftwareInstall } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateSoftwareInstall( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
					body: {},
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_SOFTWARE_INSTALL_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_INSTALL_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_SOFTWARE_INSTALL_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_INSTALL_SUCCESS',
				siteId,
				softwareSet,
			} );
		} );
	} );

	describe( 'Design Actions', () => {
		const mockedRecipe = { stylesheet: 'pub/zoologist' };
		const mockedDesign = {
			title: 'Zoologist',
			slug: 'zoologist',
			template: 'zoologist',
			theme: 'zoologist',
			categories: [ { slug: 'featured', name: 'Featured' } ],
			is_premium: false,
			features: [],
			recipe: mockedRecipe,
		};
		const mockedStyleVariation = {
			title: 'Default',
			slug: 'default',
			settings: {
				color: {
					palette: {
						theme: [],
					},
				},
			},
			styles: {
				color: {},
			},
		};

		const createMockedThemeSwitchApiRequest = ( payload ) => ( {
			type: 'WPCOM_REQUEST',
			request: {
				path: `/sites/${ siteSlug }/themes/mine`,
				apiVersion: '1.1',
				body: payload,
				method: 'POST',
			},
		} );

		const createMockedThemeSetupApiRequest = ( payload ) => ( {
			type: 'WPCOM_REQUEST',
			request: {
				path: `/sites/${ siteSlug }/theme-setup`,
				apiNamespace: 'wpcom/v2',
				body: payload,
				method: 'POST',
			},
		} );

		it( 'should call global styles API to set the styles if the design has style variation', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const generator = setDesignOnSite( siteSlug, mockedDesign, {
				styleVariation: mockedStyleVariation,
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);
		} );

		it( 'should not send vertical_id to theme-setup API if the design is not verticalizable', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const generator = setDesignOnSite( siteSlug, {
				...mockedDesign,
				verticalizable: false,
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: WP_COM_REQUEST to /sites/${ siteSlug }/theme-setup is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSetupApiRequest( {
					trim_content: true,
				} )
			);
		} );

		it( 'should send vertical_id to theme-setup API if the design is verticalizable and vertical id is passed', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const mockedSiteVerticalId = '1';
			const generator = setDesignOnSite(
				siteSlug,
				{
					...mockedDesign,
					verticalizable: true,
				},
				{ verticalId: mockedSiteVerticalId }
			);

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: WP_COM_REQUEST to /sites/${ siteSlug }/theme-setup is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSetupApiRequest( {
					trim_content: true,
					vertical_id: mockedSiteVerticalId,
				} )
			);
		} );

		it( 'should send pattern_ids to theme-setup API if the recipe of the design has this property', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const patternIds = [ 1, 2, 3 ];
			const generator = setDesignOnSite( siteSlug, {
				...mockedDesign,
				recipe: {
					...mockedRecipe,
					pattern_ids: patternIds,
				},
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: WP_COM_REQUEST to /sites/${ siteSlug }/theme-setup is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSetupApiRequest( {
					trim_content: true,
					pattern_ids: patternIds,
				} )
			);
		} );

		it( 'should send header_pattern_ids to theme-setup API if the recipe of the design has this property', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const headerPatternIds = [ 1, 2, 3 ];
			const generator = setDesignOnSite( siteSlug, {
				...mockedDesign,
				recipe: {
					...mockedRecipe,
					header_pattern_ids: headerPatternIds,
				},
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: WP_COM_REQUEST to /sites/${ siteSlug }/theme-setup is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSetupApiRequest( {
					trim_content: true,
					header_pattern_ids: headerPatternIds,
				} )
			);
		} );

		it( 'should send footer_pattern_ids to theme-setup API if the recipe of the design has this property', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const footerPatternIds = [ 1, 2, 3 ];
			const generator = setDesignOnSite( siteSlug, {
				...mockedDesign,
				recipe: {
					...mockedRecipe,
					footer_pattern_ids: footerPatternIds,
				},
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: WP_COM_REQUEST to /sites/${ siteSlug }/theme-setup is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSetupApiRequest( {
					trim_content: true,
					footer_pattern_ids: footerPatternIds,
				} )
			);
		} );

		it( 'should not call theme-setup api if the design is any of the anchor designs', () => {
			const { setDesignOnSite } = createActions( mockedClientCredentials );
			const generator = setDesignOnSite( siteSlug, {
				...mockedDesign,
				template: 'hannah',
			} );

			// First iteration: WP_COM_REQUEST to /sites/${ siteSlug }/themes/mine is fired
			expect( generator.next().value ).toEqual(
				createMockedThemeSwitchApiRequest( {
					theme: 'zoologist',
					dont_change_homepage: true,
				} )
			);

			// Second iteration: Complete the cycle
			expect( generator.next().done ).toEqual( true );
		} );
	} );
} );
