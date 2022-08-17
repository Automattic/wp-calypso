import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import request, { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

declare global {
	interface Window {
		BlazePress?: {
			render: ( params: {
				domNodeId?: string;
				stripeKey: string;
				apiHost: string;
				apiPrefix: string;
				authToken: string;
				template: string;
				urn: string;
				onLoaded?: () => void;
				showDialog?: boolean;
			} ) => void;
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
}

export async function showDSP(
	siteId: number | string,
	postId: number | string,
	domNodeId?: string
) {
	await loadDSPWidgetJS();
	return new Promise( ( resolve, reject ) => {
		if ( window.BlazePress ) {
			window.BlazePress.render( {
				domNodeId: domNodeId ?? '',
				stripeKey: config( 'dsp_stripe_pub_key' ),
				apiHost: 'https://public-api.wordpress.com',
				apiPrefix: `/wpcom/v2/sites/${ siteId }/wordads/dsp`,
				// todo fetch rlt somehow
				authToken: 'wpcom-proxy-request',
				template: 'article',
				onLoaded: () => resolve( true ),
				urn: `urn:wpcom:post:${ siteId }:${ postId || 0 }`,
			} );
		} else {
			reject( false );
		}
	} );
}

export async function showDSPWidgetModal( siteId: number, postId?: number ) {
	await loadDSPWidgetJS();

	if ( window.BlazePress ) {
		await window.BlazePress.render( {
			stripeKey: config( 'dsp_stripe_pub_key' ),
			apiHost: 'https://public-api.wordpress.com',
			apiPrefix: `/wpcom/v2/sites/${ siteId }/wordads/dsp`,
			// todo fetch rlt somehow
			authToken: 'wpcom-proxy-request',
			template: 'article',
			urn: `urn:wpcom:post:${ siteId }:${ postId || 0 }`,
			showDialog: true, // for now
		} );
	}
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
