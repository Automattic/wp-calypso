import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import { type Flow } from '../../types';

/**
 * Hook to track the start of a signup flow.
 */
interface Props {
	flow: Flow;
}

export const useSignUpStartTracking = ( { flow }: Props ) => {
	const [ queryParams ] = useSearchParams();
	const ref = queryParams.get( 'ref' ) || '';
	const flowVariant = flow.variantSlug;
	const flowName = flow.name;
	const isSignupFlow = flow.isSignupFlow;
	const signupStartEventProps = flow.useSignupStartEventProps?.();

	const extraProps = useMemo(
		() => ( {
			...signupStartEventProps,
			...( flowVariant && { flow_variant: flowVariant } ),
		} ),
		[ signupStartEventProps, flowVariant ]
	);

	useEffect( () => {
		if ( ! isSignupFlow ) {
			return;
		}

		recordSignupStart( flowName, ref, extraProps || {} );
	}, [ extraProps, flowName, ref, isSignupFlow ] );
};
