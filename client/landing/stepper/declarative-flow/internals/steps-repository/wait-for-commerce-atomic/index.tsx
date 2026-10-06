import { Step } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { waitForPluginsActive } from 'calypso/landing/stepper/utils/wait-for-plugins-active';
import type { Step as StepType } from '../../types';

const WaitForCommerceAtomic: StepType< { submits: { ready: boolean } } > = ( { navigation } ) => {
	const query = useQuery();
	const siteId = Number( query.get( 'siteId' ) );
	const { setSiteSetupError } = useDispatch( SITE_STORE );
	const submitRef = useRef( navigation.submit );
	submitRef.current = navigation.submit;

	useEffect( () => {
		let cancelled = false;

		if ( ! Number.isSafeInteger( siteId ) || siteId <= 0 ) {
			setSiteSetupError( 'invalid_site_id', 'The site could not be found.' );
			submitRef.current?.( { ready: false } );
			return;
		}

		waitForPluginsActive( siteId, [ 'woocommerce' ] )
			.then( () => {
				if ( ! cancelled ) {
					submitRef.current?.( { ready: true } );
				}
			} )
			.catch( ( error ) => {
				if ( ! cancelled ) {
					setSiteSetupError( 'commerce_atomic_wait_failed', String( error ) );
					submitRef.current?.( { ready: false } );
				}
			} );

		return () => {
			cancelled = true;
		};
	}, [ siteId, setSiteSetupError ] );

	return <Step.Loading />;
};

export default WaitForCommerceAtomic;
