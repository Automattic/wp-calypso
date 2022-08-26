import { useSiteLogoMutation } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useCallback } from 'react';
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
	const state = getState();

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

	const postSiteSettings = useCallback( async () => {
		if ( ! site ) {
			return;
		}

		await saveSiteSettings( site.ID, {
			blogname: state.siteTitle,
			blogdescription: state.siteDescription,
		} );

		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! state.siteTitle,
			has_tagline: !! state.siteDescription,
		} );
	}, [ site, saveSiteSettings, state ] );

	const postSiteLogo = useCallback( async () => {
		if ( ! state.siteLogo ) {
			return;
		}

		try {
			await setSiteLogo( new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' ) );
		} catch ( _error ) {
			// communicate the error to the user
		}
	}, [ setSiteLogo, state ] );

	const completeLinkInBioFlow = () => {
		setPendingAction( async () => {
			setProgress( 0 );
			setProgressTitle( __( 'Completing your purchase' ) );
			await postSiteSettings();

			setProgress( 0.5 );
			setProgressTitle( __( 'Cutting the ribbon. Popping a cork.' ) );

			await wait( 1500 );

			setProgress( 0.8 );
			setProgressTitle( __( 'Flinging the doors open' ) );
			await wait( 1500 );

			await postSiteLogo();
			setProgress( 1 );
			await wait( 1500 );
			return { destination: 'launchpad' };
		} );
	};

	const completeNewsletterFlow = () => {
		setPendingAction( async () => {
			setProgressTitle( __( 'Applying the last few stamps' ) );
			setProgress( 0 );
			await postSiteSettings();
			setProgress( 0.3 );
			await wait( 1500 );

			await postSiteLogo();
			setProgress( 1 );

			setProgressTitle( __( 'Crisply folding your Newsletter' ) );
			await wait( 2000 );
			return { destination: 'subscribers' };
		} );
	};

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( flow === 'link-in-bio' ) {
			completeLinkInBioFlow();
		} else {
			completeNewsletterFlow();
		}

		submit?.();
	}, [ site ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
};

export default CompletingPurchase;
