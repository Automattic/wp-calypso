import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { getHotjarSiteSettings, mayWeLoadHotJarScript } from 'calypso/lib/analytics/hotjar';

declare global {
	interface Window {
		Odie?: {
			render: ( params: {
				authToken: string;
				siteId: number | null;
				domNode?: HTMLElement | null;
				locale?: string;
				hotjarSiteSettings?: object;
				onLoaded?: () => void;
				botJids?: string[];
			} ) => void;
			strings: any; // would be used for translations
		};
	}
}

export async function loadOdieWidgetJS(): Promise< void > {
	// check if already loaded
	if ( window.Odie ) {
		return;
	}

	// To test the widget locally:
	// Run `yarn widget:dev:wpcom` in odie-client
	// Change `odie_widget_js_src` in development.json to `http://localhost:3004/widget.js`
	const odieWidgetJS: string = config( 'odie_widget_js_src' );
	const src = odieWidgetJS + '?ver=' + Math.round( Date.now() / ( 1000 * 60 * 60 ) );
	await loadScript( src );
	// Load the strings so that translations get associated with the module and loaded properly.
	// The module will assign the placeholder component to `window.Odie.strings` as a side-effect,
	// in order to ensure that translate calls are not removed from the production build.
	// await import( './string' );
}

export async function showOdie(
	siteId: number | null,
	domNodeOrId?: HTMLElement | string | null,
	locale?: string
) {
	await loadOdieWidgetJS();
	return new Promise( ( resolve, reject ) => {
		if ( window.Odie ) {
			window.Odie.render( {
				authToken: 'wpcom-proxy-request',
				domNode: typeof domNodeOrId !== 'string' ? domNodeOrId : undefined,
				locale,
				hotjarSiteSettings: { ...getHotjarSiteSettings(), isEnabled: mayWeLoadHotJarScript() },
				onLoaded: () => resolve( true ),
				siteId,
				botJids: [ 'wapuu-bot@xmpp.jetpacksandbox.com' ],
			} );
		} else {
			reject( false );
		}
	} );
}
