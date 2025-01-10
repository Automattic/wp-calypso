import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STEPPER_TRACKS_EVENT_SIGNUP_START } from 'calypso/landing/stepper/constants';
import recordSignupStart from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-signup-start';
import useSnakeCasedKeys from 'calypso/landing/stepper/utils/use-snake-cased-keys';
import { adTrackSignupStart } from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { setSignupStartTime } from 'calypso/signup/storageUtils';
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
	const flowName = flow.name;
	const flowVariant = flow.variantSlug;
	const isSignupFlow = flow.isSignupFlow;
	const customPropsConfig = flow.useTracksEventProps?.();
	const isLoading = customPropsConfig?.isLoading;
	const signupStartEventProps = useSnakeCasedKeys( {
		input: customPropsConfig?.eventsProperties[ STEPPER_TRACKS_EVENT_SIGNUP_START ],
	} );

	/**
	 * Timers and other analytics
	 *
	 * Important: Ideally, this hook should only run once per signup (`isSignupFlow`) session.
	 * Avoid introducing more dependencies.
	 */
	useEffect( () => {
		if ( ! isSignupFlow ) {
			return;
		}

		setSignupStartTime();
		// Google Analytics
		gaRecordEvent( 'Signup', 'calypso_signup_start' );
		// Marketing
		adTrackSignupStart( flowName );
	}, [ isSignupFlow, flowName ] );

	useEffect( () => {
		if ( ! isSignupFlow || isLoading ) {
			return;
		}

		recordSignupStart( {
			flow: flowName,
			ref,
			optionalProps: {
				...signupStartEventProps,
				...( flowVariant && { flow_variant: flowVariant } ),
			},
		} );
	}, [ isSignupFlow, flowName, ref, signupStartEventProps, isLoading, flowVariant ] );
};
