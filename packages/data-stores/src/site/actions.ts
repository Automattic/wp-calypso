import { isEnabled } from '@automattic/calypso-config';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '@automattic/global-styles/src/constants';
import { __ } from '@wordpress/i18n';
import { SiteGoal } from '../onboard';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	SiteLaunchError,
	AtomicTransferError,
	LatestAtomicTransferError,
	AtomicSoftwareStatusError,
	AtomicSoftwareInstallError,
	GlobalStyles,
	AssembleSiteOptions,
} from './types';
import { createCustomHomeTemplateContent } from './utils';
import type {
	CreateSiteParams,
	NewSiteErrorResponse,
	NewSiteSuccessResponse,
	SiteDetails,
	SiteError,
	Cart,
	Domain,
	LatestAtomicTransfer,
	SiteLaunchError as SiteLaunchErrorType,
	AtomicTransferError as AtomicTransferErrorType,
	LatestAtomicTransferError as LatestAtomicTransferErrorType,
	AtomicSoftwareStatusError as AtomicSoftwareStatusErrorType,
	AtomicSoftwareInstallError as AtomicSoftwareInstallErrorType,
	AtomicSoftwareStatus,
	SiteSettings,
	ActiveTheme,
	CurrentTheme,
} from './types';
import type { WpcomClientCredentials } from '../shared-types';
import type { RequestTemplate } from '../templates';
import type { Design, DesignOptions } from '@automattic/design-picker/src/types'; // Import from a specific file directly to avoid the circular dependencies

export function createActions( clientCreds: WpcomClientCredentials ) {
	const fetchSite = () => ( {
		type: 'FETCH_SITE' as const,
	} );

	const fetchNewSite = () => ( {
		type: 'FETCH_NEW_SITE' as const,
	} );

	const receiveNewSite = ( response: NewSiteSuccessResponse ) => ( {
		type: 'RECEIVE_NEW_SITE' as const,
		response,
	} );

	const receiveNewSiteFailed = ( error: NewSiteErrorResponse ) => ( {
		type: 'RECEIVE_NEW_SITE_FAILED' as const,
		error,
	} );

	function* createSite( params: CreateSiteParams ) {
		yield fetchNewSite();
		try {
			const { authToken, ...providedParams } = params;

			const defaultParams = {
				client_id: clientCreds.client_id,
				client_secret: clientCreds.client_secret,
				// will find an available `*.wordpress.com` url based on the `blog_name`
				find_available_url: true,
				// Private site is default, but overridable, setting
				public: -1,
			};

			const mergedParams = {
				...defaultParams,
				...providedParams,
				// Set to false because site validation should be a separate action
				validate: false,
			};

			const newSite: NewSiteSuccessResponse = yield wpcomRequest( {
				path: '/sites/new',
				apiVersion: '1.1',
				method: 'post',
				body: mergedParams,
				token: authToken,
			} );

			yield receiveNewSite( newSite );
			return true;
		} catch ( err ) {
			yield receiveNewSiteFailed( err as NewSiteErrorResponse );
			return false;
		}
	}

	const receiveSite = ( siteId: number, response: SiteDetails | undefined ) => ( {
		type: 'RECEIVE_SITE' as const,
		siteId,
		response,
	} );

	const receiveSiteTitle = ( siteId: number, name: string | undefined ) => ( {
		type: 'RECEIVE_SITE_TITLE' as const,
		siteId,
		name,
	} );

	const receiveSiteTagline = ( siteId: number, tagline: string | undefined ) => ( {
		type: 'RECEIVE_SITE_TAGLINE' as const,
		siteId,
		tagline,
	} );

	const receiveSiteVerticalId = ( siteId: number, verticalId: string | undefined ) => ( {
		type: 'RECEIVE_SITE_VERTICAL_ID' as const,
		siteId,
		verticalId,
	} );

	const receiveSiteFailed = ( siteId: number, response: SiteError ) => ( {
		type: 'RECEIVE_SITE_FAILED' as const,
		siteId,
		response,
	} );

	const reset = () => ( {
		type: 'RESET_SITE_STORE' as const,
	} );

	const resetNewSiteFailed = () => ( {
		type: 'RESET_RECEIVE_NEW_SITE_FAILED' as const,
	} );

	const launchSiteStart = ( siteId: number ) => ( {
		type: 'LAUNCH_SITE_START' as const,
		siteId,
	} );

	const launchSiteSuccess = ( siteId: number ) => ( {
		type: 'LAUNCH_SITE_SUCCESS' as const,
		siteId,
	} );

	const launchSiteFailure = ( siteId: number, error: SiteLaunchErrorType ) => ( {
		type: 'LAUNCH_SITE_FAILURE' as const,
		siteId,
		error,
	} );

	function* launchSite( siteId: number ) {
		yield launchSiteStart( siteId );
		try {
			yield wpcomRequest( {
				path: `/sites/${ siteId }/launch`,
				apiVersion: '1.1',
				method: 'post',
			} );
			yield launchSiteSuccess( siteId );
		} catch ( _ ) {
			yield launchSiteFailure( siteId, SiteLaunchError.INTERNAL );
		}
	}

	// TODO: move getCart and setCart to a 'cart' data-store
	function* getCart( siteId: number ) {
		const success: Cart = yield wpcomRequest( {
			path: '/me/shopping-cart/' + siteId,
			apiVersion: '1.1',
			method: 'GET',
		} );
		return success;
	}

	const receiveSiteDomains = ( siteId: number, domains: Domain[] ) => ( {
		type: 'RECEIVE_SITE_DOMAINS' as const,
		siteId,
		domains,
	} );

	const receiveSiteTheme = ( siteId: number, theme: CurrentTheme ) => ( {
		type: 'RECEIVE_SITE_THEME' as const,
		siteId,
		theme,
	} );

	const receiveSiteSettings = ( siteId: number, settings: SiteSettings ) => ( {
		type: 'RECEIVE_SITE_SETTINGS' as const,
		siteId,
		settings,
	} );

	const updateSiteSettings = ( siteId: number, settings: SiteSettings ) => ( {
		type: 'UPDATE_SITE_SETTINGS' as const,
		siteId,
		settings,
	} );

	function* setCart( siteId: number, cartData: Cart ) {
		const success: Cart = yield wpcomRequest( {
			path: '/me/shopping-cart/' + siteId,
			apiVersion: '1.1',
			method: 'POST',
			body: cartData,
		} );
		return success;
	}

	const receiveSiteGlobalStyles = ( siteId: number, globalStyles: GlobalStyles ) => ( {
		type: 'RECEIVE_SITE_GLOBAL_STYLES' as const,
		siteId,
		globalStyles,
	} );

	function* getGlobalStyles( siteId: number, stylesheet: string ) {
		const globalStyles: GlobalStyles = yield wpcomRequest( {
			path: `/sites/${ siteId }/global-styles/themes/${ stylesheet }`,
			apiNamespace: 'wp/v2',
		} );

		yield receiveSiteGlobalStyles( siteId, globalStyles );

		return globalStyles;
	}

	function* setGlobalStyles(
		siteIdOrSlug: number | string,
		stylesheet: string,
		globalStyles: GlobalStyles,
		activatedTheme?: ActiveTheme
	) {
		// only update if there settings or styles to update
		if (
			Object.keys( globalStyles.settings ?? {} ).length ||
			Object.keys( globalStyles.styles ?? {} ).length
		) {
			const globalStylesId: number =
				activatedTheme?.global_styles_id || ( yield getGlobalStylesId( siteIdOrSlug, stylesheet ) );

			const updatedGlobalStyles: GlobalStyles = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteIdOrSlug ) }/global-styles/${ globalStylesId }`,
				apiNamespace: 'wp/v2',
				method: 'POST',
				body: {
					id: globalStylesId,
					settings: globalStyles.settings ?? {},
					styles: globalStyles.styles ?? {},
				},
			} );

			return updatedGlobalStyles;
		}
	}

	function* resetGlobalStyles(
		siteIdOrSlug: number | string,
		stylesheet: string,
		activatedTheme?: ActiveTheme
	) {
		const globalStylesId: number =
			activatedTheme?.global_styles_id || ( yield getGlobalStylesId( siteIdOrSlug, stylesheet ) );

		const updatedGlobalStyles: GlobalStyles = yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteIdOrSlug ) }/global-styles/${ globalStylesId }`,
			apiNamespace: 'wp/v2',
			method: 'POST',
			body: {
				id: globalStylesId,
				settings: {},
				styles: {},
			},
		} );

		return updatedGlobalStyles;
	}

	function* getGlobalStylesId( siteIdOrSlug: number | string, stylesheet: string ) {
		const theme: ActiveTheme = yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteIdOrSlug ) }/themes/${ stylesheet }`,
			method: 'GET',
			apiNamespace: 'wp/v2',
		} );

		const globalStylesUrl = theme?._links?.[ 'wp:user-global-styles' ]?.[ 0 ]?.href;
		if ( globalStylesUrl ) {
			// eslint-disable-next-line no-useless-escape
			const match = globalStylesUrl.match( /global-styles\/(?<id>[\/\w-]+)/ );
			if ( match && match.groups ) {
				return match.groups.id;
			}
		}

		return null;
	}

	function* getGlobalStylesVariations( siteIdOrSlug: number | string, stylesheet: string ) {
		const variations: GlobalStyles[] = yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent(
				siteIdOrSlug
			) }/global-styles/themes/${ stylesheet }/variations`,
			method: 'GET',
			apiNamespace: 'wp/v2',
		} );

		return variations;
	}

	function* saveSiteSettings(
		siteId: number,
		settings: {
			blogname?: string;
			blogdescription?: string;
			launchpad_screen?: string;
			site_vertical_id?: string;
			woocommerce_store_address?: string;
			woocommerce_store_address_2?: string;
			woocommerce_store_city?: string;
			woocommerce_store_postcode?: string;
			woocommerce_defaut_country?: string;
			woocommerce_onboarding_profile?: { [ key: string ]: any };
		}
	) {
		try {
			// extract this into its own function as a generic settings setter
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/settings`,
				apiVersion: '1.4',
				body: settings,
				method: 'POST',
			} );
			if ( 'blogname' in settings ) {
				yield receiveSiteTitle( siteId, settings.blogname );
			}
			if ( 'blogdescription' in settings ) {
				yield receiveSiteTagline( siteId, settings.blogdescription );
			}
			if ( 'site_vertical_id' in settings ) {
				yield receiveSiteVerticalId( siteId, settings.site_vertical_id );
			}
			yield updateSiteSettings( siteId, settings );
		} catch ( e ) {}
	}

	function* setIntentOnSite( siteSlug: string, intent: string ) {
		try {
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteSlug ) }/site-intent`,
				apiNamespace: 'wpcom/v2',
				body: { site_intent: intent },
				method: 'POST',
			} );
		} catch ( e ) {}
	}

	function* setStaticHomepageOnSite( siteID: number, pageId: number ) {
		try {
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteID ) }/homepage`,
				apiVersion: '1.1',
				body: { is_page_on_front: true, page_on_front_id: pageId },
				method: 'POST',
			} );
		} catch ( e ) {}
	}

	function* setGoalsOnSite( siteSlug: string, goals: SiteGoal[] ) {
		try {
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteSlug ) }/site-goals`,
				apiNamespace: 'wpcom/v2',
				body: { site_goals: goals },
				method: 'POST',
			} );
		} catch ( e ) {}
	}

	function* saveSiteTitle( siteId: number, blogname: string | undefined ) {
		yield saveSiteSettings( siteId, { blogname } );
	}

	function* saveSiteTagline( siteId: number, blogdescription: string | undefined ) {
		yield saveSiteSettings( siteId, { blogdescription } );
	}

	function* installTheme( siteSlugOrId: string | string, themeSlug: string ) {
		yield wpcomRequest( {
			path: `/sites/${ siteSlugOrId }/themes/${ themeSlug }/install`,
			apiVersion: '1.1',
			method: 'POST',
		} );
	}

	function* runThemeSetupOnSite( siteSlug: string ) {
		yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteSlug ) }/theme-setup/?_locale=user`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} );
	}

	function* setDesignOnSite(
		siteSlug: string,
		selectedDesign: Design,
		options: DesignOptions = {}
	) {
		const themeSlug =
			selectedDesign.slug ||
			selectedDesign.recipe?.stylesheet?.split( '/' )[ 1 ] ||
			selectedDesign.theme;
		const { styleVariation, globalStyles } = options;
		const activatedTheme: ActiveTheme = yield wpcomRequest( {
			path: `/sites/${ siteSlug }/themes/mine?_locale=user`,
			apiVersion: '1.1',
			body: {
				theme: themeSlug,
			},
			method: 'POST',
		} );

		if ( styleVariation?.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG ) {
			yield* resetGlobalStyles( siteSlug, activatedTheme.stylesheet, activatedTheme );
		}
		// @todo Always use the global styles for consistency
		else if ( styleVariation?.slug ) {
			const variations: GlobalStyles[] = yield* getGlobalStylesVariations(
				siteSlug,
				activatedTheme.stylesheet
			);
			const currentVariation = variations.find(
				( variation ) =>
					variation.title &&
					variation.title.split( ' ' ).join( '-' ).toLowerCase() === styleVariation?.slug
			);

			if ( currentVariation ) {
				yield* setGlobalStyles(
					siteSlug,
					activatedTheme.stylesheet,
					currentVariation,
					activatedTheme
				);
			}
		}

		if ( globalStyles ) {
			yield* setGlobalStyles( siteSlug, activatedTheme.stylesheet, globalStyles, activatedTheme );
		}

		// Potentially runs Headstart.
		// E.g. if the homepage has a Query Loop block, we insert placeholder posts on the new site.
		yield* runThemeSetupOnSite( siteSlug );

		return activatedTheme;
	}

	function* createCustomTemplate(
		siteSlug: string,
		stylesheet: string,
		slug: string,
		title: string,
		content: string
	) {
		const templateId = `${ stylesheet }//${ slug }`;
		let existed = true;
		try {
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteSlug ) }/templates/${ templateId }`,
				apiNamespace: 'wp/v2',
				method: 'GET',
			} );
		} catch {
			existed = false;
		}

		const templatePath = `templates/${ existed ? templateId : '' }`;
		yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteSlug ) }/${ templatePath }`,
			apiNamespace: 'wp/v2',
			body: {
				slug,
				theme: stylesheet,
				title,
				content,
				status: 'publish',
				is_wp_suggestion: true,
			},
			method: 'POST',
		} );
	}

	function* assembleSite(
		siteSlug: string,
		stylesheet = '',
		{
			homeHtml,
			headerHtml,
			footerHtml,
			pages,
			globalStyles,
			canReplaceContent,
			siteSetupOption,
		}: AssembleSiteOptions = {}
	) {
		const templates = [
			{
				type: 'wp_template' as const,
				slug: 'home',
				title: __( 'Home' ),
				content: createCustomHomeTemplateContent(
					stylesheet,
					!! headerHtml,
					!! footerHtml,
					!! homeHtml,
					homeHtml
				),
			},
			headerHtml && {
				type: 'wp_template_part' as const,
				slug: 'header',
				title: __( 'Header' ),
				content: headerHtml,
			},
			footerHtml && {
				type: 'wp_template_part' as const,
				slug: 'footer',
				title: __( 'Footer' ),
				content: footerHtml,
			},
		].filter( Boolean ) as RequestTemplate[];

		const endpointSuffix = isEnabled( 'pattern-assembler/perf-test' ) ? '-perf-test' : '';

		yield wpcomRequest( {
			path: `/sites/${ encodeURIComponent( siteSlug ) }/site-assembler${ endpointSuffix }`,
			apiNamespace: 'wpcom/v2',
			body: {
				templates,
				pages,
				global_styles: globalStyles,
				can_replace_content: canReplaceContent,
				site_setup_option: siteSetupOption,
			},
			method: 'POST',
		} );
	}

	const setSiteSetupError = ( error: string, message: string ) => ( {
		type: 'SET_SITE_SETUP_ERROR',
		error,
		message,
	} );

	const clearSiteSetupError = ( siteId: number ) => ( {
		type: 'CLEAR_SITE_SETUP_ERROR',
		siteId,
	} );

	const atomicTransferStart = (
		siteId: number,
		softwareSet: string | undefined,
		transferIntent: string | undefined
	) => ( {
		type: 'ATOMIC_TRANSFER_START' as const,
		siteId,
		softwareSet,
		transferIntent,
	} );

	const atomicTransferSuccess = (
		siteId: number,
		softwareSet: string | undefined,
		transferIntent: string | undefined
	) => ( {
		type: 'ATOMIC_TRANSFER_SUCCESS' as const,
		siteId,
		softwareSet,
		transferIntent,
	} );

	const atomicTransferFailure = (
		siteId: number,
		softwareSet: string | undefined,
		error: AtomicTransferErrorType
	) => ( {
		type: 'ATOMIC_TRANSFER_FAILURE' as const,
		siteId,
		softwareSet,
		error,
	} );

	function* initiateAtomicTransfer(
		siteId: number,
		softwareSet: string | undefined,
		transferIntent: string | undefined
	) {
		yield atomicTransferStart( siteId, softwareSet, transferIntent );
		try {
			const body = {
				context: softwareSet || 'unknown',
				software_set: softwareSet ? encodeURIComponent( softwareSet ) : undefined,
				transfer_intent: transferIntent ? encodeURIComponent( transferIntent ) : undefined,
			};

			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/atomic/transfers`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body,
			} );
			yield atomicTransferSuccess( siteId, softwareSet, transferIntent );
		} catch ( _ ) {
			yield atomicTransferFailure( siteId, softwareSet, AtomicTransferError.INTERNAL );
		}
	}

	const latestAtomicTransferStart = ( siteId: number ) => ( {
		type: 'LATEST_ATOMIC_TRANSFER_START' as const,
		siteId,
	} );

	const latestAtomicTransferSuccess = ( siteId: number, transfer: LatestAtomicTransfer ) => ( {
		type: 'LATEST_ATOMIC_TRANSFER_SUCCESS' as const,
		siteId,
		transfer,
	} );

	const latestAtomicTransferFailure = (
		siteId: number,
		error: LatestAtomicTransferErrorType
	) => ( {
		type: 'LATEST_ATOMIC_TRANSFER_FAILURE' as const,
		siteId,
		error,
	} );

	function* requestLatestAtomicTransfer( siteId: number ) {
		yield latestAtomicTransferStart( siteId );

		try {
			const transfer: LatestAtomicTransfer = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/atomic/transfers/latest`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} );
			yield latestAtomicTransferSuccess( siteId, transfer );
		} catch ( err ) {
			yield latestAtomicTransferFailure( siteId, err as LatestAtomicTransferError );
		}
	}

	const atomicSoftwareStatusStart = ( siteId: number, softwareSet: string ) => ( {
		type: 'ATOMIC_SOFTWARE_STATUS_START' as const,
		siteId,
		softwareSet,
	} );

	const atomicSoftwareStatusSuccess = (
		siteId: number,
		softwareSet: string,
		status: AtomicSoftwareStatus
	) => ( {
		type: 'ATOMIC_SOFTWARE_STATUS_SUCCESS' as const,
		siteId,
		softwareSet,
		status,
	} );

	const atomicSoftwareStatusFailure = (
		siteId: number,
		softwareSet: string,
		error: AtomicSoftwareStatusErrorType
	) => ( {
		type: 'ATOMIC_SOFTWARE_STATUS_FAILURE' as const,
		siteId,
		softwareSet,
		error,
	} );

	function* requestAtomicSoftwareStatus( siteId: number, softwareSet: string ) {
		yield atomicSoftwareStatusStart( siteId, softwareSet );
		try {
			const status: AtomicSoftwareStatus = yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/atomic/software/${ encodeURIComponent(
					softwareSet
				) }`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} );
			yield atomicSoftwareStatusSuccess( siteId, softwareSet, status );
		} catch ( err ) {
			yield atomicSoftwareStatusFailure( siteId, softwareSet, err as AtomicSoftwareStatusError );
		}
	}

	const atomicSoftwareInstallStart = ( siteId: number, softwareSet: string ) => ( {
		type: 'ATOMIC_SOFTWARE_INSTALL_START' as const,
		siteId,
		softwareSet,
	} );

	const atomicSoftwareInstallSuccess = ( siteId: number, softwareSet: string ) => ( {
		type: 'ATOMIC_SOFTWARE_INSTALL_SUCCESS' as const,
		siteId,
		softwareSet,
	} );

	const atomicSoftwareInstallFailure = (
		siteId: number,
		softwareSet: string,
		error: AtomicSoftwareInstallErrorType
	) => ( {
		type: 'ATOMIC_SOFTWARE_INSTALL_FAILURE' as const,
		siteId,
		softwareSet,
		error,
	} );

	function* initiateSoftwareInstall( siteId: number, softwareSet: string ) {
		yield atomicSoftwareInstallStart( siteId, softwareSet );
		try {
			yield wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/atomic/software/${ encodeURIComponent(
					softwareSet
				) }`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: {},
			} );
			yield atomicSoftwareInstallSuccess( siteId, softwareSet );
		} catch ( err ) {
			yield atomicSoftwareInstallFailure( siteId, softwareSet, err as AtomicSoftwareInstallError );
		}
	}

	const setBundledPluginSlug = ( siteSlug: string, pluginSlug: string ) => ( {
		type: 'SET_BUNDLED_PLUGIN_SLUG' as const,
		siteSlug,
		pluginSlug,
	} );

	return {
		receiveSiteDomains,
		receiveSiteSettings,
		receiveSiteTheme,
		saveSiteTitle,
		saveSiteSettings,
		setIntentOnSite,
		setStaticHomepageOnSite,
		setGoalsOnSite,
		receiveSiteTitle,
		fetchNewSite,
		fetchSite,
		receiveNewSite,
		receiveNewSiteFailed,
		resetNewSiteFailed,
		installTheme,
		setDesignOnSite,
		createCustomTemplate,
		assembleSite,
		createSite,
		receiveSite,
		receiveSiteFailed,
		receiveSiteTagline,
		receiveSiteVerticalId,
		updateSiteSettings,
		saveSiteTagline,
		reset,
		launchSite,
		launchSiteStart,
		launchSiteSuccess,
		launchSiteFailure,
		getCart,
		setCart,
		getGlobalStyles,
		setGlobalStyles,
		receiveSiteGlobalStyles,
		setSiteSetupError,
		clearSiteSetupError,
		initiateAtomicTransfer,
		atomicTransferStart,
		atomicTransferSuccess,
		atomicTransferFailure,
		latestAtomicTransferStart,
		latestAtomicTransferSuccess,
		latestAtomicTransferFailure,
		requestLatestAtomicTransfer,
		atomicSoftwareStatusStart,
		atomicSoftwareStatusSuccess,
		atomicSoftwareStatusFailure,
		requestAtomicSoftwareStatus,
		initiateSoftwareInstall,
		atomicSoftwareInstallStart,
		atomicSoftwareInstallSuccess,
		atomicSoftwareInstallFailure,
		setBundledPluginSlug,
	};
}

export type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'fetchNewSite' ]
			| ActionCreators[ 'fetchSite' ]
			| ActionCreators[ 'receiveSiteDomains' ]
			| ActionCreators[ 'receiveSiteSettings' ]
			| ActionCreators[ 'receiveSiteTheme' ]
			| ActionCreators[ 'receiveNewSite' ]
			| ActionCreators[ 'receiveSiteTitle' ]
			| ActionCreators[ 'receiveNewSiteFailed' ]
			| ActionCreators[ 'receiveSiteTagline' ]
			| ActionCreators[ 'receiveSiteVerticalId' ]
			| ActionCreators[ 'receiveSite' ]
			| ActionCreators[ 'receiveSiteFailed' ]
			| ActionCreators[ 'updateSiteSettings' ]
			| ActionCreators[ 'receiveSiteGlobalStyles' ]
			| ActionCreators[ 'reset' ]
			| ActionCreators[ 'resetNewSiteFailed' ]
			| ActionCreators[ 'launchSiteStart' ]
			| ActionCreators[ 'launchSiteSuccess' ]
			| ActionCreators[ 'launchSiteFailure' ]
			| ActionCreators[ 'atomicTransferStart' ]
			| ActionCreators[ 'atomicTransferSuccess' ]
			| ActionCreators[ 'atomicTransferFailure' ]
			| ActionCreators[ 'latestAtomicTransferStart' ]
			| ActionCreators[ 'latestAtomicTransferSuccess' ]
			| ActionCreators[ 'latestAtomicTransferFailure' ]
			| ActionCreators[ 'atomicSoftwareStatusStart' ]
			| ActionCreators[ 'atomicSoftwareStatusSuccess' ]
			| ActionCreators[ 'atomicSoftwareStatusFailure' ]
			| ActionCreators[ 'atomicSoftwareInstallStart' ]
			| ActionCreators[ 'atomicSoftwareInstallSuccess' ]
			| ActionCreators[ 'atomicSoftwareInstallFailure' ]
			| ActionCreators[ 'setBundledPluginSlug' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
