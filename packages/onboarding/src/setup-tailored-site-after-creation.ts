import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Onboard } from '@automattic/data-stores';
import { select } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import {
	isLinkInBioFlow,
	isNewsletterOrLinkInBioFlow,
	LINK_IN_BIO_FLOW,
	FREE_FLOW,
	isFreeFlow,
	isGeneralOnboardingFlow,
} from './utils';

const ONBOARD_STORE = Onboard.register();

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
	// const { resetOnboardStore } = dispatch( ONBOARD_STORE );
	const selectedPatternContent = select( ONBOARD_STORE ).getPatternContent();
	const siteTitle = select( ONBOARD_STORE ).getSelectedSiteTitle();
	const siteDescription = select( ONBOARD_STORE ).getSelectedSiteDescription();
	const siteLogo = select( ONBOARD_STORE ).getSelectedSiteLogo();

	if ( siteId && flowName ) {
		const formData: ( string | File )[][] = [];
		const settings: {
			blogname?: string;
			blogdescription?: string;
			launchpad_screen?: string;
			site_intent?: string;
		} = {};

		if ( isGeneralOnboardingFlow( flowName ) ) {
			settings.launchpad_screen = 'full';
		} else {
			settings.blogname = siteTitle;
			settings.blogdescription = siteDescription;

			if ( isNewsletterOrLinkInBioFlow( flowName ) || isFreeFlow( flowName ) ) {
				// link-in-bio and link-in-bio-tld are considered the same intent.
				if ( isLinkInBioFlow( flowName ) || isFreeFlow( flowName ) ) {
					settings.site_intent = isLinkInBioFlow( flowName ) ? LINK_IN_BIO_FLOW : FREE_FLOW;
					if ( selectedPatternContent ) {
						const pattern = {
							content: selectedPatternContent,
							template: 'blank',
						};
						formData.push( [ 'pattern', JSON.stringify( pattern ) ] );
					}
				} else {
					settings.site_intent = flowName;
				}

				settings.launchpad_screen = 'full';
			}
		}

		formData.push( [ 'settings', JSON.stringify( settings ) ] );

		if ( siteLogo ) {
			formData.push( [
				'site_icon',
				new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' ),
			] );
		}

		return wpcomRequest< { updated: object } >( {
			path: `/sites/${ siteId }/onboarding-customization`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			apiVersion: '2',
			formData,
		} ).then( () => {
			recordTracksEvent( 'calypso_signup_site_options_submit', {
				has_site_title: !! siteTitle,
				has_tagline: !! siteDescription,
			} );
			/**
			 * We need to wait the site being created, then go to checkout and wait for the user
			 * to buy the plan before we can set a premium theme to the site. If we reset the store
			 * here we loose this information.
			 */
			// resetOnboardStore();
		} );
	}
}
