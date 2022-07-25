import config from '@automattic/calypso-config';

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
			} ) => void;
		};
	}
}

export async function loadDSPWidgetJS( onLoad?: () => void ) {
	// check if already loaded
	if ( window.BlazePress ) {
		if ( onLoad ) {
			await onLoad();
		}
		return;
	}
	const script = document.createElement( 'script' );
	script.src = config( 'dsp_widget_js_src' );
	script.async = true;
	if ( onLoad ) {
		script.onload = onLoad;
	}
	document.body.appendChild( script );
}

export async function showDSPWidgetModal( siteId: number, postId?: number ) {
	if ( ! window.BlazePress ) {
		await loadDSPWidgetJS( async () => await showDSPWidgetModal( siteId, postId ) );
	} else {
		await window.BlazePress.render( {
			stripeKey: config( 'dsp_stripe_pub_key' ),
			apiHost: 'https://public-api.wordpress.com',
			apiPrefix: `/wpcom/v2/sites/${ siteId }/wordads/dsp`,
			// todo fetch rlt somehow
			authToken: 'wpcom-proxy-request',
			template: 'article',
			urn: `urn:wpcom:post:${ siteId }:${ postId || 0 }`,
		} );
	}
}
