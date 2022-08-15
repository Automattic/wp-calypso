import { useSiteLogoMutation } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const CompletingPurchase: Step = function CompletingPurchase( { navigation, flow } ) {
	const { __ } = useI18n();
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const site = useSite();
	const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );

	const { getState } = useSelect( ( select ) => select( ONBOARD_STORE ) );

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
		const blob = new Blob( [ buffer ], { type: type } );

		return blob;
	};

	const completeLinkInBioFlow = () => {
		if ( site ) {
			setPendingAction( async () => {
				setProgress( 0 );
				setProgressTitle( __( 'Completing Purchase' ) );
				const state = getState();
				await saveSiteSettings( site.ID, {
					blogname: state.siteTitle,
					blogdescription: state.siteDescription,
				} );

				recordTracksEvent( 'calypso_signup_site_options_submit', {
					has_site_title: !! state.siteTitle,
					has_tagline: !! state.siteDescription,
				} );
				setProgress( 0.5 );
				setProgressTitle( __( 'Creating your Link in Bio' ) );

				await wait( 1000 );

				setProgress( 0.8 );
				setProgressTitle( __( 'Preparing Next Steps' ) );

				if ( state.siteLogo ) {
					try {
						await setSiteLogo(
							new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' )
						);
					} catch ( _error ) {
						// communicate the error to the user
					}
				}
				setProgress( 1 );
			} );
		}
	};
	useEffect( () => {
		if ( flow === 'link-in-bio' ) {
			completeLinkInBioFlow();
		} else {
			setPendingAction( async () => {
				setProgressTitle( __( 'Completing Purchase' ) );
				setProgress( 0.3 );
				await wait( 2000 );
				setProgress( 1 );
			} );
		}
		submit?.();
	} );

	return null;
};

export default CompletingPurchase;
