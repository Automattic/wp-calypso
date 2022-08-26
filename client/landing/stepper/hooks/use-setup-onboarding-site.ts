import { SiteDetails, useSiteLogoMutation } from '@automattic/data-stores';
import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from 'react';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const base64ImageToBlob = ( base64String: string ) => {
	// extract content type and base64 payload from original string
	const pos = base64String.indexOf( ';base64,' );
	const type = base64String.substring( 5, pos );
	const b64 = base64String.substr( pos + 8 );

	// decode base64
	const imageContent = atob( b64 );

	// create an ArrayBuffer and a view (as unsigned 8-bit)
	const buffer = new ArrayBuffer( imageContent.length );
	const view = new Uint8Array( buffer );

	// fill the view, using the decoded base64
	for ( let n = 0; n < imageContent.length; n++ ) {
		view[ n ] = imageContent.charCodeAt( n );
	}

	// convert ArrayBuffer to Blob
	return new Blob( [ buffer ], { type: type } );
};

interface OnboardingSite {
	siteTitle: string;
	siteDescription: string;
	siteLogo: string | null;
}

interface SetupOnboardingSiteOptions {
	ignoreUrl?: boolean;
	site: SiteDetails | null;
	flow: string | null;
}

export function useSetupOnboardingSite( options: SetupOnboardingSiteOptions ) {
	const { ignoreUrl, site, flow } = options;
	const siteIsLoaded = !! site;

	const { getState } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const state = getState();
	const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );

	const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );

	const postSiteSettings = ( site: SiteDetails, state: OnboardingSite ) => {
		const siteSettings = {
			blogname: state.siteTitle,
			blogdescription: state.siteDescription,
		};

		return saveSiteSettings( site.ID, siteSettings );
	};

	const postSiteLogo = ( state: OnboardingSite ) => {
		if ( ! state.siteLogo ) {
			return;
		}
		return setSiteLogo( new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' ) );
	};

	const setIntent = ( site: SiteDetails, flow: string | null ) => {
		if ( site && flow && isNewsletterOrLinkInBioFlow( flow ) ) {
			return setIntentOnSite( site.ID.toString(), flow );
		}
		return Promise.resolve();
	};

	return useMemo( () => {
		if ( ( ignoreUrl || shouldSetupOnboardingSite() ) && site && flow ) {
			return Promise.all( [
				postSiteSettings( site, state ),
				postSiteLogo( state ),
				setIntent( site, flow ),
			] ).then( () => {
				recordTracksEvent( 'calypso_signup_site_options_submit', {
					has_site_title: !! state.siteTitle,
					has_tagline: !! state.siteDescription,
				} );
			} );
		}
		// we want this to run once, ignore other deps
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteIsLoaded, flow ] );
}

export function shouldSetupOnboardingSite() {
	return new URLSearchParams( window.location.search ).get( 'complete-setup' ) === 'true';
}
