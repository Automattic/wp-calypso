import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { Step } from '../../types';
import './style.scss';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const CompletingPurchase: Step = function CompletingPurchase( { navigation } ) {
	const { __ } = useI18n();
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle, setProgress } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		setPendingAction( async () => {
			setProgressTitle( __( 'Completing Purchase' ) );
			setProgress( 1 );
			await wait( 2000 );
		} );

		submit?.();
	} );

	return null;
};

export default CompletingPurchase;
