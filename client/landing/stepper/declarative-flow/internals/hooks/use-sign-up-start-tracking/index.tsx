import debugFactory from 'debug';
import { useEffect, useMemo } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import { type Flow } from '../../types';

/**
 * Hook to track the start of a signup flow.
 */
interface Props {
	flow: Flow;
	currentStepRoute: string;
}
const debug = debugFactory( 'calypso:landing:stepper:analytics' );
export const TRACKING_LOCAL_STORAGE_KEY = 'signed_up_tracked';

const setTrackingState = ( id: string ) => {
	const data = JSON.parse( localStorage.getItem( TRACKING_LOCAL_STORAGE_KEY ) || '{}' );
	const newState = {
		...data,
		[ id ]: true,
	};

	localStorage.setItem( TRACKING_LOCAL_STORAGE_KEY, JSON.stringify( newState ) );
	return newState;
};

const getTrackingState = () => {
	try {
		return JSON.parse( localStorage.getItem( TRACKING_LOCAL_STORAGE_KEY ) || '{}' );
	} catch {
		return {};
	}
};

const wasAlreadyTracked = ( flowName: string ) => {
	try {
		const state = getTrackingState();
		return state[ flowName ] === true;
	} catch ( e ) {
		debug( 'Error parsing signedUp from localStorage', e );
		return false;
	}
};

function trackSignUpEvent( flow: Flow, ref: string, extraProps: Record< string, unknown > = {} ) {
	recordSignupStart( flow.name, ref, extraProps || {} );
	const trackId = flow.variantSlug ?? flow.name;

	debug( 'Recorded signup start tracked', trackId, ref, extraProps );
	setTrackingState( trackId );
}

export const useSignUpStartTracking = ( { flow }: Props ) => {
	const queryParams = useQuery();
	const ref = queryParams.get( 'ref' ) || '';

	const flowVariant = flow.variantSlug;
	const signupStartEventProps = flow.useSignupStartEventProps?.();

	const extraProps = useMemo(
		() => ( {
			...signupStartEventProps,
			...( flowVariant && { flow_variant: flowVariant } ),
		} ),
		[ signupStartEventProps, flowVariant ]
	);
	const flowName = flow.name;
	const isSignUpFlow = flow.isSignupFlow;

	useEffect( () => {
		if ( ! isSignUpFlow || wasAlreadyTracked( flowVariant ?? flowName ) ) {
			debug( 'Track skipped: Tracking already done for this flow' );
			return;
		}

		trackSignUpEvent( flow, ref, extraProps );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
};
