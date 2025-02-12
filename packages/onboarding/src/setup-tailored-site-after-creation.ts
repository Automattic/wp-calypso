import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	Onboard,
	Site,
	OnboardSelect,
	SiteActions,
	updateLaunchpadSettings,
} from '@automattic/data-stores';
import { select, dispatch } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { isNewsletterFlow, isFreeFlow } from './utils';
import type { ActiveTheme } from '@automattic/data-stores';

const ONBOARD_STORE = Onboard.register();
// `client_id` and `client_secret` are only needed when signing up users.
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
	// const { resetOnboardStore } = dispatch( ONBOARD_STORE );
	const goals = ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals();
	const selectedDesign = ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign();
	const siteTitle = ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle();
	const siteDescription = ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription();
	const siteLogo = ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteLogo();

	if ( siteId && flowName ) {
		const formData: ( string | File )[][] = [];
		const settings: {
			blogname: string;
			blogdescription: string;
			launchpad_screen?: string;
			site_goals?: Array< string >;
			site_intent?: string;
		} = {
			blogname: siteTitle,
			blogdescription: siteDescription,
		};

		const promises = [];

		if ( isNewsletterFlow( flowName ) || isFreeFlow( flowName ) ) {
			if ( isFreeFlow( flowName ) ) {
				// We removed the link in free flow, we need to keep this reference here to avoid side effects.
				settings.site_intent = 'free';
				if ( selectedDesign && selectedDesign.is_virtual ) {
					const { assembleSite } = dispatch( SITE_STORE ) as SiteActions;
					promises.push(
						wpcomRequest< ActiveTheme[] >( {
							path: `/sites/${ encodeURIComponent( siteId ) }/themes?status=active`,
							apiNamespace: 'wp/v2',
						} ).then( ( activeThemes ) => {
							assembleSite( String( siteId ), activeThemes[ 0 ].stylesheet, {
								homeHtml: selectedDesign.recipe?.pattern_html,
								headerHtml: selectedDesign.recipe?.header_html,
								footerHtml: selectedDesign.recipe?.footer_html,
								siteSetupOption: 'assembler-virtual-theme',
							} );
						} )
					);
				}
			} else {
				settings.site_intent = flowName;
			}

			settings.launchpad_screen = 'full';
		}

		// Newsletter flow sets "paid-newsletter" goal as an indication to setup paid newsletter later on
		if ( isNewsletterFlow( flowName ) && goals && goals.length > 0 ) {
			settings.site_goals = Array.from( goals );
		}

		formData.push( [ 'settings', JSON.stringify( settings ) ] );

		if ( siteLogo ) {
			formData.push( [
				'site_icon',
				new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' ),
			] );
		}

		promises.push(
			wpcomRequest< { updated: object } >( {
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
			} )
		);

		if ( isFreeFlow( flowName ) ) {
			if ( siteTitle || siteDescription || siteLogo ) {
				promises.push(
					updateLaunchpadSettings( siteId, {
						checklist_statuses: { setup_free: true },
					} )
				);
			}
		}

		return Promise.all( promises );
	}
}
