/* eslint-disable no-console */
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const WooTransfer: Step = function WooTransfer( { navigation } ) {
	const { submit } = navigation;
	const { setPendingAction, setProgressTitle } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		setPendingAction( async () => {
			setProgressTitle( 'Transfering site' );
			await wait( 3000 );
			// TODO actually transfer
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default WooTransfer;
