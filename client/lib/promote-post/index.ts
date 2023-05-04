import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import wpcom from 'calypso/lib/wp';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

declare global {
	interface Window {
		BlazePress?: {
			render: ( params: {
				siteSlug: string | null;
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
				translateFn?: ( value: string, options?: any ) => string;
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
	const src =
		config( 'dsp_widget_js_src' ) + '?ver=' + Math.round( Date.now() / ( 1000 * 60 * 60 ) );
	await loadScript( src );
	// Load the strings so that translations get associated with the module and loaded properly.
	// The module will assign the placeholder component to `window.BlazePress.strings` as a side-effect,
	// in order to ensure that translate calls are not removed from the production build.
	await import( './string' );
}

export async function showDSP(
	siteSlug: string | null,
	siteId: number | string,
	postId: number | string,
	onClose: () => void,
	source: string,
	translateFn: ( value: string, options?: any ) => string,
	localizeUrlFn: ( fullUrl: string ) => string,
	domNodeOrId?: HTMLElement | string | null,
	setShowCancelButton?: ( show: boolean ) => void,
	setShowTopBar?: ( show: boolean ) => void,
	locale?: string
) {
	await loadDSPWidgetJS();
	return new Promise( ( resolve, reject ) => {
		if ( window.BlazePress ) {
			const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );

			window.BlazePress.render( {
				siteSlug: siteSlug,
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
				urn: `urn:wpcom:post:${ siteId }:${ postId || 0 }`,
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
	const eventProps = {
		entry_point: entryPoint,
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

export enum BlazeCreditStatus {
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

	const value = useSelector( ( state ) => getSiteOption( state, selectedSite?.ID, 'can_blaze' ) );

	switch ( value ) {
		case false:
			return PromoteWidgetStatus.DISABLED;
		case true:
			return PromoteWidgetStatus.ENABLED;
		default:
			return PromoteWidgetStatus.FETCHING;
	}
};

/**
 * Hook to verify if we should enable blaze credits
 *
 * @returns bool
 */
export const useBlazeCredits = (): BlazeCreditStatus => {
	return useSelector( ( state ) => {
		const userData = getCurrentUser( state );
		return userData?.blaze_credits_enabled ? BlazeCreditStatus.ENABLED : BlazeCreditStatus.DISABLED;
	} );
};
