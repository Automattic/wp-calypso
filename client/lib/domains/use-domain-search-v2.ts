import config from '@automattic/calypso-config';
import { useEffect, useState } from 'react';

/**
 * This hook is used to determine if the domain search redesign is enabled for a given flow.
 * It should NOT be used within components, only at top level pages.
 */
export const useDomainSearchV2 = ( flowName: string ) => {
	const isDomainSearchV2Enabled = config.isEnabled( 'domains/ui-redesign' );
	const [ isLoading, setIsLoading ] = useState( true );

	/**
	 * Introduce an artificial delay to simulate the loading state of the experiment.
	 */
	useEffect( () => {
		const interval = setInterval( () => {
			setIsLoading( false );
		}, 750 );

		return () => clearInterval( interval );
	}, [] );

	if ( flowName === 'onboarding' && isDomainSearchV2Enabled ) {
		return [ isLoading, isDomainSearchV2Enabled ];
	}

	return [ false, isDomainSearchV2Enabled ];
};
