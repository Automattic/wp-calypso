import config from '@automattic/calypso-config';
import { initSentry, captureException } from '@automattic/calypso-sentry';
import { loadScript } from '@automattic/load-script';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import { translate } from 'i18n-calypso/types';
import { Dispatch } from 'redux';
import { getHotjarSiteSettings, mayWeLoadHotJarScript } from 'calypso/lib/analytics/hotjar';
import { getMobileDeviceInfo, isWcMobileApp, isWpMobileApp } from 'calypso/lib/mobile-app';
import versionCompare from 'calypso/lib/version-compare';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	getSiteOption,
	isJetpackSite,
	isJetpackModuleActive,
	isJetpackMinimumVersion,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:promote-post' );

const DSP_ERROR_NO_LOCAL_USER = 'no_local_user';
const DSP_URL_CHECK_UPSERT_USER = '/user/check';

type NewDSPUserResult = {
	new_dsp_user: boolean;
};

type DSPError = {
	errorCode: string;
};

declare global {
	interface Window {
		BlazePress?: {
			render: ( params: {
				siteSlug: string | null;
				siteId?: number | string;
				domNode?: HTMLElement | null;
				domNodeId?: string;
				stripeKey: string;
				apiHost: string;
				apiPrefix: string;
				authToken: string;
				template: string;
				urn: string;
				campaignId?: string;
				origin: string;
				originProps?: DSPOriginProps;
				onLoaded?: () => void;
				onClose?: () => void;
				translateFn?: typeof translate;
				localizeUrlFn?: ( fullUrl: string ) => string;
				locale?: string;
				showDialog?: boolean;
				setShowCancelButton?: ( show: boolean ) => void;
				setShowTopBar?: ( show: boolean ) => void;
				uploadImageLabel?: string;
				showGetStartedMessage?: boolean;
				onGetStartedMessageClose?: ( dontShowAgain: boolean ) => void;
				source?: string;
				isRunningInBlazePlugin?: boolean;
				isRunningInWooBlaze?: boolean;
				isRunningInJetpack?: boolean;
				jetpackXhrParams?: {
					apiRoot: string;
					headerNonce: string;
				};
				jetpackVersion?: string;
				blazeAdsVersion?: string;
				hotjarSiteSettings?: object;
				recordDSPEvent?: ( name: string, props?: any ) => void;
				options?: object;
			} ) => void;
			cleanup: () => void;
			strings: any;
		};
	}
}

const getWidgetDSPJSURL = () => {
	return config( 'dsp_widget_js_src' );
};

export async function loadDSPWidgetJS(): Promise< boolean > {
	// check if already loaded
	if ( window.BlazePress ) {
		debug( 'loadDSPWidgetJS: [Loaded] widget assets already loaded' );
		return true;
	}

	const src = `${ getWidgetDSPJSURL() }?ver=${ Math.round( Date.now() / ( 1000 * 60 * 60 ) ) }`;

	try {
		await loadScript( src );
		debug( 'loadDSPWidgetJS: [Loaded]', src );

		// Load the strings so that translations get associated with the module and loaded properly.
		// The module will assign the placeholder component to `window.BlazePress.strings` as a side-effect,
		// in order to ensure that translate calls are not removed from the production build.
		await import( './string' );
		debug( 'loadDSPWidgetJS: [Translation Loaded]' );

		return true;
	} catch ( error ) {
		debug( 'loadDSPWidgetJS: [Load Error] the script failed to load: ', error );
		captureException( error );
		return false;
	}
}

const shouldHideGoToCampaignButton = () => {
	// App versions higher or equal than 22.9-rc-1 should hide the button
	const deviceInfo = getMobileDeviceInfo();
	return versionCompare( deviceInfo?.version, '22.9-rc-1', '>=' );
};

const getWidgetOptions = () => {
	return {
		hideGoToCampaignsButton: shouldHideGoToCampaignButton(),
	};
};

export interface DSPOriginProps {
	isAtomic?: boolean;
	isClassicSimple?: boolean;
}

export const getDSPOrigin = ( originProps: DSPOriginProps | undefined ) => {
	const { isAtomic = false } = originProps ?? {};

	// We need to check for Woo first, because Woo Blaze is also running in Jetpack (At least in this iteration)
	if ( config.isEnabled( 'is_running_in_woo_site' ) ) {
		return 'wc-blaze-plugin';
	} else if ( config.isEnabled( 'is_running_in_blaze_plugin' ) ) {
		return 'wp-blaze-plugin';
	} else if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		return isAtomic ? 'jetpack-atomic' : 'jetpack';
	} else if ( isWpMobileApp() ) {
		return 'wp-mobile-app';
	} else if ( isWcMobileApp() ) {
		return 'wc-mobile-app';
	}

	return 'calypso';
};

export async function showDSP(
	siteSlug: string | null,
	siteId: number | string,
	postId: number | string,
	onClose: () => void,
	source: string,
	translateFn: typeof translate,
	localizeUrlFn: ( fullUrl: string ) => string,
	domNodeOrId?: HTMLElement | string | null,
	setShowCancelButton?: ( show: boolean ) => void,
	setShowTopBar?: ( show: boolean ) => void,
	locale?: string,
	jetpackVersion?: string,
	blazeAdsVersion?: string,
	dispatch?: Dispatch,
	dspOriginProps?: DSPOriginProps,
	campaignId?: string
): Promise< boolean > {
	const origin = getDSPOrigin( dspOriginProps ?? {} );

	// Increase Sentry sample rate to 100% for DSP widget
	await initSentry( { sampleRate: 1.0 } );

	// Loading the DSP widget JS assets
	await loadDSPWidgetJS();

	return new Promise( ( resolve, reject ) => {
		if ( ! window.BlazePress ) {
			dispatch?.( recordTracksEvent( 'calypso_dsp_widget_failed_to_load', { origin } ) );
			reject( false );
			return;
		}

		try {
			const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );
			const isRunningInWooBlaze = config.isEnabled( 'is_running_in_woo_site' );
			const isRunningInBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );
			const isMobileApp = isWpMobileApp() || isWcMobileApp();

			window.BlazePress.render( {
				siteSlug: siteSlug,
				siteId: siteId,
				domNode: typeof domNodeOrId !== 'string' ? domNodeOrId : undefined,
				domNodeId: typeof domNodeOrId === 'string' ? domNodeOrId : undefined,
				stripeKey: config( 'dsp_stripe_pub_key' ),
				apiHost: 'https://public-api.wordpress.com',
				apiPrefix: `/wpcom/v2/sites/${ siteId }/wordads/dsp`,
				// todo fetch rlt somehow
				authToken: 'wpcom-proxy-request',
				template: 'article',
				origin,
				originProps: dspOriginProps,
				onLoaded: () => {
					debug( 'showDSP: [Widget loaded]' );
					resolve( true );
				},
				onClose: onClose,
				translateFn: translateFn,
				localizeUrlFn: localizeUrlFn,
				locale,
				urn: postId && postId !== '0' ? `urn:wpcom:post:${ siteId }:${ postId || 0 }` : '',
				campaignId: campaignId && campaignId !== '0' ? campaignId : '',
				setShowCancelButton: setShowCancelButton,
				setShowTopBar: setShowTopBar,
				uploadImageLabel: isMobileApp ? __( 'Tap to add image' ) : undefined,
				showGetStartedMessage: ! isMobileApp, // Don't show the GetStartedMessage in the mobile app.
				source: source,
				isRunningInBlazePlugin,
				isRunningInWooBlaze,
				isRunningInJetpack,
				jetpackXhrParams: isRunningInJetpack
					? {
							apiRoot: config( 'api_root' ),
							headerNonce: config( 'nonce' ),
					  }
					: undefined,
				jetpackVersion,
				blazeAdsVersion,
				hotjarSiteSettings: { ...getHotjarSiteSettings(), isEnabled: mayWeLoadHotJarScript() },
				recordDSPEvent: dispatch ? getRecordDSPEventHandler( dispatch, dspOriginProps ) : undefined,
				options: getWidgetOptions(),
			} );

			debug( 'showDSP: [Widget started]' );
		} catch ( error ) {
			debug( 'showDSP: [Widget start error] the widget render method execution failed: ', error );
			captureException( error );

			dispatch?.( recordTracksEvent( 'calypso_dsp_widget_failed_to_start', { origin } ) );
			reject( false );
		}
	} );
}

export async function cleanupDSP() {
	if ( window.BlazePress ) {
		window.BlazePress.cleanup?.();
	}
}

/**
 * Add tracking when launching the DSP widget, in both tracks event and MC stats.
 * @param {string} entryPoint - A slug describing the entry point.
 */
export function recordDSPEntryPoint( entryPoint: string, dspOrigin: DSPOriginProps ) {
	const eventProps = {
		entry_point: entryPoint,
		origin: getDSPOrigin( dspOrigin ),
	};

	return composeAnalytics(
		recordTracksEvent( 'calypso_dsp_widget_start', eventProps ),
		bumpStat( 'calypso_dsp_widget_start', entryPoint )
	);
}

/**
 * Gets the recordTrack function to be used in the DSP widget
 * @param {Dispatch} dispatch - Redux disptach function
 */
export function getRecordDSPEventHandler( dispatch: Dispatch, dspOriginProps?: DSPOriginProps ) {
	return ( eventName: string, props?: any ) => {
		const eventProps = {
			origin: getDSPOrigin( dspOriginProps ),
			...props,
		};
		dispatch( recordTracksEvent( eventName, eventProps ) );
	};
}

type SupportedDSPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';
type SupportedDSPApiVersions = '1' | '1.1';

export const requestDSP = async < T >(
	siteId: number,
	apiUri: string,
	method: SupportedDSPMethods = 'GET',
	body: Record< string, unknown > | undefined = undefined,
	apiVersion: SupportedDSPApiVersions = '1'
): Promise< T > => {
	const URL_BASE = `/sites/${ siteId }/wordads/dsp/api/v${ apiVersion }`;

	let requestBody = body;
	let path = `${ URL_BASE }${ apiUri }`;

	// Merges the query params into the requestBody, and removes them from the path variable
	// Query params in the path causes problems on Jetpack sites using plain permalinks
	if ( path.indexOf( '?' ) > 0 ) {
		const search = path.substring( path.indexOf( '?' ) );
		path = path.substring( 0, path.indexOf( '?' ) );

		const queryParams = Object.fromEntries( new URLSearchParams( search ) );
		requestBody = {
			...requestBody,
			...queryParams,
		};
	}

	const params = {
		path,
		method,
		apiNamespace: config.isEnabled( 'is_running_in_jetpack_site' )
			? 'jetpack/v4/blaze-app'
			: 'wpcom/v2',
	};

	switch ( method ) {
		case 'POST':
			return await wpcom.req.post( params, requestBody );
		case 'PUT':
			return await wpcom.req.put( params, requestBody );
		case 'DELETE':
			return await wpcom.req.del( params, requestBody );
		default:
			return await wpcom.req.get( params, requestBody );
	}
};

export const requestDSPHandleErrors = async < T >(
	siteId: number,
	apiUri: string,
	method: SupportedDSPMethods = 'GET',
	body: Record< string, unknown > | undefined = undefined,
	apiVersion: SupportedDSPApiVersions = '1'
): Promise< T > => {
	try {
		return await requestDSP( siteId, apiUri, method, body, apiVersion );
	} catch ( error ) {
		if ( ( error as DSPError ).errorCode === DSP_ERROR_NO_LOCAL_USER ) {
			const createUserQuery = await requestDSP< NewDSPUserResult >(
				siteId,
				DSP_URL_CHECK_UPSERT_USER
			);
			if ( createUserQuery.new_dsp_user ) {
				// then we should retry the original query
				return await requestDSP( siteId, apiUri, method, body );
			}
		}
		throw error;
	}
};

export enum PromoteWidgetStatus {
	FETCHING = 'fetching',
	ENABLED = 'enabled',
	DISABLED = 'disabled',
}

/**
 * Hook to get all props needed to calculate the DSP origin
 * @returns The props to use when calculating the DSP origin
 */
export const useDspOriginProps = (): DSPOriginProps => {
	const selectedSite = useSelector( getSelectedSite );

	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSite?.ID ?? 0 ) );
	const isClassicSimple = selectedSite?.options?.is_wpcom_simple ?? false;
	return { isAtomic, isClassicSimple };
};

/**
 * Hook to verify if we should enable the promote widget.
 * @returns bool
 */
export const usePromoteWidget = (): PromoteWidgetStatus => {
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID ?? 0;

	// On Jetpack sites, starting with v. 12.3-a.9,
	// folks can also use the Blaze module to enable/disable the Blaze feature.
	const isBlazeModuleActive = ( state: object, siteId: number ) => {
		// On WordPress.com sites, the Blaze module is always active.
		if ( ! isJetpackSite( state, siteId ) ) {
			return true;
		}

		// On old versions of Jetpack, there is no module.
		if ( ! isJetpackMinimumVersion( state, siteId, '12.3-a.9' ) ) {
			return true;
		}

		return isJetpackModuleActive( state, siteId, 'blaze' );
	};

	const isSiteEligible = useSelector( ( state ) => {
		// First, check status form the API.
		const isEligible = getSiteOption( state, siteId, 'can_blaze' );

		// Then check if the Blaze module is active.
		const isModuleActive = isBlazeModuleActive( state, siteId );

		return isEligible && isModuleActive;
	} );

	switch ( isSiteEligible ) {
		case false:
			return PromoteWidgetStatus.DISABLED;
		case true:
			return PromoteWidgetStatus.ENABLED;
		default:
			return PromoteWidgetStatus.FETCHING;
	}
};

/**
 * Hook to verify if Jetpack/Blaze Ads version is greater than or equals the provided versions.
 * It will return true if any of the checks passes.
 * @param siteId Site Id.
 * @param minJetpackVersion Minimum Jetpack version to check.
 * @param minBlazeAdsVersion Minimum Blaze Ads version to check.
 */
export const useJetpackBlazeVersionCheck = (
	siteId: number,
	minJetpackVersion: string,
	minBlazeAdsVersion: string
): boolean => {
	const siteJetpackVersion =
		useSelector( ( state ) => getSiteOption( state, siteId, 'jetpack_version' ) ) ?? 0;
	const blazeAdsVersion =
		useSelector( ( state ) => getSiteOption( state, siteId, 'blaze_ads_version' ) ) ?? 0;

	// If we don't have a version (Jetpack or Blaze Ads), we must be in a simple site, and we use latest Jetpack version in there.
	if ( ! siteJetpackVersion && ! blazeAdsVersion ) {
		return true;
	}

	return Boolean(
		( siteJetpackVersion && versionCompare( siteJetpackVersion, minJetpackVersion, '>=' ) ) ||
			( blazeAdsVersion && versionCompare( siteJetpackVersion, minBlazeAdsVersion, '>=' ) )
	);
};
