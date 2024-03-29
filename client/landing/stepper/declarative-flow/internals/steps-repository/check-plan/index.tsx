/* eslint-disable no-console */
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import type { Step } from '../../types';

const CheckPlan: Step = function CheckPlan( { navigation } ) {
	const { submit } = navigation;
	const site = useSite();

	useEffect( () => {
		if ( ! site ) {
			return;
		}
		submit?.( { currentPlan: site.plan } );

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site ] );

	return null;
};

export default CheckPlan;
