import { addQueryArgs } from '@wordpress/url';
import { useSiteData } from './use-site-data';

export const useEntrepreneurAdminDestination = (): string | null => {
	const { site } = useSiteData();
	if ( ! site || ! site?.URL ) {
		return null;
	}

	if ( ! globalThis.URL.canParse( site.URL ) ) {
		return null;
	}

	const siteUrl = new globalThis.URL( site.URL );

	if ( ! siteUrl ) {
		return null;
	}

	if ( siteUrl.hostname.endsWith( '.wordpress.com' ) ) {
		siteUrl.hostname = siteUrl.hostname.replace( '.wordpress.com', '.wpcomstaging.com' );
	}

	siteUrl.pathname = '/wp-login.php';

	return addQueryArgs( siteUrl.href, {
		action: 'jetpack-sso',
		redirect_to:
			'/wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=entrepreneur-signup',
	} );
};
