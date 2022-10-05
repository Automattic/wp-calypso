import { SiteDetails, useSiteLogoMutation } from '@automattic/data-stores';
import { isTailoredSignupFlow, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { patterns } from '@automattic/pattern-picker';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Pattern } from '@automattic/pattern-picker';

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

	const { getState, getPatternId } = useSelect( ( select ) => select( ONBOARD_STORE ) );
	const state = getState();
	const { saveSiteSettings, setIntentOnSite, setStaticHomepageOnSite } = useDispatch( SITE_STORE );

	const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );

	const selectedPatternId = getPatternId();

	const postSiteSettings = ( site: SiteDetails, state: OnboardingSite ) => {
		const siteSettings = {
			blogname: state.siteTitle,
			blogdescription: state.siteDescription,
		};

		return saveSiteSettings( site.ID, siteSettings );
	};

	const postSiteLogo = ( state: OnboardingSite ) => {
		if ( ! state.siteLogo ) {
			return Promise.resolve();
		}
		return setSiteLogo( new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' ) );
	};

	const setIntent = ( site: SiteDetails, flow: string ) => {
		if ( isTailoredSignupFlow( flow ) ) {
			return setIntentOnSite( site.ID.toString(), flow );
		}
		return Promise.resolve();
	};

	const setLaunchpadScreen = ( site: SiteDetails, flow: string ) => {
		if ( isTailoredSignupFlow( flow ) ) {
			return saveSiteSettings( site.ID, {
				launchpad_screen: 'full',
			} );
		}
		return Promise.resolve();
	};

	const setPattern = async (
		site: SiteDetails,
		flow: string,
		logoUploadResult: Awaited< ReturnType< typeof setSiteLogo > > | void
	) => {
		if ( flow === LINK_IN_BIO_FLOW ) {
			const pattern = patterns.find( ( pattern: Pattern ) => pattern.id === selectedPatternId );
			if ( pattern ) {
				let content = pattern.content;
				// replace the pattern logo with the uploaded site logo
				if ( logoUploadResult?.uploadResult?.media?.[ 0 ] && pattern.avatarUrl ) {
					content = content.replace(
						pattern.avatarUrl,
						logoUploadResult.uploadResult.media[ 0 ].URL
					);
				}
				await wpcomRequest( {
					// since this is a new site, its safe to assume that homepage ID is 2
					path: `/sites/${ site.ID }/pages/2`,
					method: 'POST',
					apiNamespace: 'wp/v2',
					body: { content, template: 'blank' },
				} );

				return setStaticHomepageOnSite( site.ID, 2 );
			}
		}
	};

	return useMemo( () => {
		if ( ( ignoreUrl || shouldSetupOnboardingSite() ) && site && flow ) {
			return Promise.all( [
				postSiteSettings( site, state ),
				postSiteLogo( state ).then( ( logoUploadResult ) =>
					setPattern( site, flow, logoUploadResult )
				),
				setIntent( site, flow ),
				setLaunchpadScreen( site, flow ),
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
