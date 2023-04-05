import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import request, { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

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
				locale?: string;
				showDialog?: boolean;
				setShowCancelButton?: ( show: boolean ) => void;
				setShowTopBar?: ( show: boolean ) => void;
				uploadImageLabel?: string;
				showGetStartedMessage?: boolean;
				onGetStartedMessageClose?: ( dontShowAgain: boolean ) => void;
				source?: string;
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
	domNodeOrId?: HTMLElement | string | null,
	setShowCancelButton?: ( show: boolean ) => void,
	setShowTopBar?: ( show: boolean ) => void,
	locale?: string
) {
	await loadDSPWidgetJS();
	return new Promise( ( resolve, reject ) => {
		if ( window.BlazePress ) {
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
				locale,
				urn: `urn:wpcom:post:${ siteId }:${ postId || 0 }`,
				setShowCancelButton: setShowCancelButton,
				setShowTopBar: setShowTopBar,
				uploadImageLabel: isWpMobileApp() ? __( 'Tap to add image' ) : undefined,
				showGetStartedMessage: ! isWpMobileApp(), // Don't show the GetStartedMessage in the mobile app.
				source: source,
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
	await requestAllBlogsAccess();
	return await request< T >( {
		path,
		method,
		body,
		apiNamespace: 'wpcom/v2',
	} );
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
	const value = useSelector( ( state ) => {
		const userData = getCurrentUser( state );
		if ( userData ) {
			const originalSetting = userData[ 'has_promote_widget' ];
			if ( originalSetting !== undefined ) {
				return originalSetting === true
					? PromoteWidgetStatus.ENABLED
					: PromoteWidgetStatus.DISABLED;
			}
		}
		return PromoteWidgetStatus.FETCHING;
	} );
	return value;
};
