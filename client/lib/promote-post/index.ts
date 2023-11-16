import config from '@automattic/calypso-config';
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
				isRunningInJetpack?: boolean;
				jetpackXhrParams?: {
					apiRoot: string;
					headerNonce: string;
				};
				jetpackVersion?: string;
				hotjarSiteSettings?: object;
				recordDSPEvent?: ( name: string, props?: any ) => void;
				options?: object;
			} ) => void;
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

export const getDSPOrigin = () => {
	if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		return 'jetpack';
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
	dispatch?: Dispatch
) {
	await loadDSPWidgetJS();

	return new Promise( ( resolve, reject ) => {
		if ( ! window.BlazePress ) {
			dispatch?.(
				recordTracksEvent( 'calypso_dsp_widget_failed_to_load', { origin: getDSPOrigin() } )
			);
			reject( false );
			return;
		}

		try {
			const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );

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
				onLoaded: () => {
					debug( 'showDSP: [Widget loaded]' );
					resolve( true );
				},
				onClose: onClose,
				translateFn: translateFn,
				localizeUrlFn: localizeUrlFn,
				locale,
				urn: postId && postId !== '0' ? `urn:wpcom:post:${ siteId }:${ postId || 0 }` : '',
				setShowCancelButton: setShowCancelButton,
				setShowTopBar: setShowTopBar,
				uploadImageLabel: isWpMobileApp() ? __( 'Tap to add image' ) : undefined,
				showGetStartedMessage: ! isWpMobileApp(), // Don't show the GetStartedMessage in the mobile app.
				source: source,
				isRunningInJetpack,
				jetpackXhrParams: isRunningInJetpack
					? {
							apiRoot: config( 'api_root' ),
							headerNonce: config( 'nonce' ),
					  }
					: undefined,
				jetpackVersion,
				hotjarSiteSettings: { ...getHotjarSiteSettings(), isEnabled: mayWeLoadHotJarScript() },
				recordDSPEvent: dispatch ? getRecordDSPEventHandler( dispatch ) : undefined,
				options: getWidgetOptions(),
			} );

			debug( 'showDSP: [Widget started]' );
		} catch ( error ) {
			debug( 'showDSP: [Widget start error] the widget render method execution failed: ', error );

			dispatch?.(
				recordTracksEvent( 'calypso_dsp_widget_failed_to_start', { origin: getDSPOrigin() } )
			);
			reject( false );
		}
	} );
}

/**
 * Add tracking when launching the DSP widget, in both tracks event and MC stats.
 * @param {string} entryPoint - A slug describing the entry point.
 */
export function recordDSPEntryPoint( entryPoint: string ) {
	const eventProps = {
		entry_point: entryPoint,
		origin: getDSPOrigin(),
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
export function getRecordDSPEventHandler( dispatch: Dispatch ) {
	return ( eventName: string, props?: any ) => {
		const eventProps = {
			origin: getDSPOrigin(),
			...props,
		};
		dispatch( recordTracksEvent( eventName, eventProps ) );
	};
}

export const requestDSP = async < T >(
	siteId: number,
	apiUri: string,
	method = 'GET',
	body: Record< string, any > | undefined = undefined
): Promise< T > => {
	const URL_BASE = `/sites/${ siteId }/wordads/dsp/api/v1`;
	const path = `${ URL_BASE }${ apiUri }`;

	const params = {
		path,
		method,
		apiNamespace: config.isEnabled( 'is_running_in_jetpack_site' )
			? 'jetpack/v4/blaze-app'
			: 'wpcom/v2',
		body,
	};

	switch ( method ) {
		case 'POST':
			return await wpcom.req.post( params );
		case 'PUT':
			return await wpcom.req.put( params );
		case 'DELETE':
			return await wpcom.req.del( params );
		default:
			return await wpcom.req.get( params );
	}
};

const handleDSPError = async < T >(
	error: DSPError,
	siteId: number,
	currentURL: string
): Promise< T > => {
	if ( error.errorCode === DSP_ERROR_NO_LOCAL_USER ) {
		const createUserQuery = await requestDSP< NewDSPUserResult >(
			siteId,
			DSP_URL_CHECK_UPSERT_USER
		);
		if ( createUserQuery.new_dsp_user ) {
			// then we should retry the original query
			return await requestDSP< T >( siteId, currentURL );
		}
	}
	throw error;
};

export const requestDSPHandleErrors = async < T >( siteId: number, url: string ): Promise< T > => {
	try {
		return await requestDSP( siteId, url );
	} catch ( e ) {
		return await handleDSPError( e as DSPError, siteId, url );
	}
};

export enum PromoteWidgetStatus {
	FETCHING = 'fetching',
	ENABLED = 'enabled',
	DISABLED = 'disabled',
}

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
