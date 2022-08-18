import { SiteDetails, useSiteLogoMutation } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
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
	siteAccentColor: string | undefined;
	siteLogo: string | null;
}

export function useSetupOnboardingSite() {
	const site = useSite();
	const siteIsLoaded = !! site;
	const { getState } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const state = getState();
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );

	const postSiteSettings = ( site: SiteDetails, state: OnboardingSite ) => {
		const siteSettings = {
			blogname: state.siteTitle,
			blogdescription: state.siteDescription,
			accent_color: state.siteAccentColor,
		};

		if ( state.siteAccentColor ) {
			siteSettings.accent_color = state.siteAccentColor;
		}

		return saveSiteSettings( site.ID, siteSettings );
	};

	const postSiteLogo = ( state: OnboardingSite ) => {
		if ( ! state.siteLogo ) {
			return;
		}
		return setSiteLogo( new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' ) );
	};

	useEffect( () => {
		if ( shouldSetupOnboardingSite() && site ) {
			Promise.all( [ postSiteSettings( site, state ), postSiteLogo( state ) ] ).then( () => {
				recordTracksEvent( 'calypso_signup_site_options_submit', {
					has_site_title: !! state.siteTitle,
					has_tagline: !! state.siteDescription,
				} );
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteIsLoaded ] );
}

export function shouldSetupOnboardingSite() {
	return new URLSearchParams( window.location.search ).get( 'complete-setup' ) === 'true';
}
