import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useSetupOnboardingSite } from 'calypso/landing/stepper/hooks/use-setup-onboarding-site';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const CompletingPurchase: Step = function CompletingPurchase( { navigation, flow } ) {
	const { __ } = useI18n();
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );
	const site = useSite();

	const siteSetup = useSetupOnboardingSite( { ignoreUrl: true, site, flow } );

	const completeLinkInBioFlow = () => {
		setPendingAction( async () => {
			setProgress( 0 );
			setProgressTitle( __( 'Completing your purchase' ) );
			await siteSetup;

			setProgress( 0.5 );
			setProgressTitle( __( 'Cutting the ribbon. Popping a cork.' ) );
			await wait( 1500 );

			setProgress( 0.8 );
			setProgressTitle( __( 'Flinging the doors open' ) );
			await wait( 1500 );

			setProgress( 1 );
			await wait( 1500 );
			return { destination: 'launchpad' };
		} );
	};

	const completeNewsletterFlow = () => {
		setPendingAction( async () => {
			setProgressTitle( __( 'Ringing up the cash register' ) );
			setProgress( 0 );
			await siteSetup;

			setProgress( 0.3 );
			await wait( 1500 );

			setProgress( 1 );
			setProgressTitle( __( 'Completing your purchase' ) );
			await wait( 1000 );
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
