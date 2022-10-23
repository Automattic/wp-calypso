import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Site, Onboard } from '@automattic/data-stores';
import { select, dispatch } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { uploadAndSetSiteLogo } from './upload-and-set-site-logo';
import { isNewsletterOrLinkInBioFlow, LINK_IN_BIO_FLOW } from './utils';

const ONBOARD_STORE = Onboard.register();
const SITE_STORE = Site.register( { client_id: '', client_secret: '' } );

export const base64ImageToBlob = ( base64String: string ) => {
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

interface SetupOnboardingSiteOptions {
	siteId: number;
	flowName: string | null;
}

export function setupSiteAfterCreation( { siteId, flowName }: SetupOnboardingSiteOptions ) {
	const { resetOnboardStore } = dispatch( ONBOARD_STORE );
	const { saveSiteSettings, setIntentOnSite, setStaticHomepageOnSite } = dispatch( SITE_STORE );
	const selectedPatternContent = select( ONBOARD_STORE ).getPatternContent();
	const siteTitle = select( ONBOARD_STORE ).getSelectedSiteTitle();
	const siteDescription = select( ONBOARD_STORE ).getSelectedSiteDescription();
	const siteLogo = select( ONBOARD_STORE ).getSelectedSiteLogo();

	const postSiteSettings = ( siteId: number ) => {
		const siteSettings = {
			blogname: siteTitle,
			blogdescription: siteDescription,
		};

		return saveSiteSettings( siteId, siteSettings );
	};

	const postSiteLogo = () => {
		if ( ! siteLogo || ! siteId ) {
			return Promise.resolve();
		}
		return uploadAndSetSiteLogo(
			siteId,
			new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' )
		);
	};

	const setIntent = ( siteId: number, flow: string ) => {
		if ( isNewsletterOrLinkInBioFlow( flow ) ) {
			return setIntentOnSite( siteId.toString(), flow );
		}
		return Promise.resolve();
	};

	const setLaunchpadScreen = ( siteId: number, flow: string ) => {
		if ( isNewsletterOrLinkInBioFlow( flow ) ) {
			return saveSiteSettings( siteId, {
				launchpad_screen: 'full',
			} );
		}
		return Promise.resolve();
	};

	const setPattern = async ( siteId: number, flow: string ) => {
		if ( flow === LINK_IN_BIO_FLOW ) {
			await wpcomRequest( {
				// since this is a new site, its safe to assume that homepage ID is 2
				path: `/sites/${ siteId }/pages/2`,
				method: 'POST',
				apiNamespace: 'wp/v2',
				body: { content: selectedPatternContent, template: 'blank' },
			} );

			return setStaticHomepageOnSite( siteId, 2 );
		}
		return Promise.resolve();
	};

	if ( siteId && flowName ) {
		return Promise.all( [
			postSiteSettings( siteId ),
			postSiteLogo(),
			setPattern( siteId, flowName ),
			setIntent( siteId, flowName ),
			setLaunchpadScreen( siteId, flowName ),
		] ).then( () => {
			recordTracksEvent( 'calypso_signup_site_options_submit', {
				has_site_title: !! siteTitle,
				has_tagline: !! siteDescription,
			} );
			resetOnboardStore();
		} );
	}
}
