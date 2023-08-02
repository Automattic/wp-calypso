import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso/types';
import { getHotjarSiteSettings, mayWeLoadHotJarScript } from 'calypso/lib/analytics/hotjar';
import { getMobileDeviceInfo, isWpMobileApp } from 'calypso/lib/mobile-app';
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
				isV2?: boolean;
				hotjarSiteSettings?: object;
				options?: object;
			} ) => void;
			strings: any;
		};
	}
}

export async function loadDSPWidgetJS(): Promise< void > {
	// check if already loaded
	if ( window.BlazePress ) {
		return;
	}
	let dspWidgetJS: string = config( 'dsp_widget_js_src' );
	if ( config.isEnabled( 'promote-post/widget-i2' ) ) {
		dspWidgetJS = dspWidgetJS.replace( '/promote/', '/promote-v2/' );
	}
	const src = dspWidgetJS + '?ver=' + Math.round( Date.now() / ( 1000 * 60 * 60 ) );
	await loadScript( src );
	// Load the strings so that translations get associated with the module and loaded properly.
	// The module will assign the placeholder component to `window.BlazePress.strings` as a side-effect,
	// in order to ensure that translate calls are not removed from the production build.
	await import( './string' );
}

const ANDROID_VERSION_HIDE_CAMPAIGNS_BUTTON = '22.9.rc-1';

type DeviceInfo = {
	device: string;
	version: string;
};

const shouldHideGoToCampaignButton = () => {
	// Android versions higher or equal than 22.9.rc-1 should hide the button
	const deviceInfo = getMobileDeviceInfo() as DeviceInfo;
	return (
		deviceInfo.device.includes( 'android' ) &&
		versionCompare( deviceInfo?.version, ANDROID_VERSION_HIDE_CAMPAIGNS_BUTTON, '>=' )
	);
};

const getWidgetOptions = () => {
	return {
		hideGoToCampaignsButton: shouldHideGoToCampaignButton(),
	};
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
	isV2?: boolean
) {
	await loadDSPWidgetJS();
	return new Promise( ( resolve, reject ) => {
		if ( window.BlazePress ) {
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
				onLoaded: () => resolve( true ),
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
				isV2,
				hotjarSiteSettings: { ...getHotjarSiteSettings(), isEnabled: mayWeLoadHotJarScript() },
				options: getWidgetOptions(),
			} );
		} else {
			reject( false );
		}
	} );
}

/**
 * Add tracking when launching the DSP widget, in both tracks event and MC stats.
 *
 * @param {string} entryPoint - A slug describing the entry point.
 */
export function recordDSPEntryPoint( entryPoint: string ) {
	let origin = 'wpcom';
	if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		origin = 'jetpack';
	} else if ( isWpMobileApp() ) {
		origin = 'wp-mobile-app';
	}

	const eventProps = {
		entry_point: entryPoint,
		origin,
	};

	return composeAnalytics(
		recordTracksEvent( 'calypso_dsp_widget_start', eventProps ),
		bumpStat( 'calypso_dsp_widget_start', entryPoint )
	);
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

export enum PromoteWidgetStatus {
	FETCHING = 'fetching',
	ENABLED = 'enabled',
	DISABLED = 'disabled',
}

/**
 * Hook to verify if we should enable the promote widget.
 *
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
