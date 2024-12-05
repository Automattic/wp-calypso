import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { MutationSaveFeedbackVariables } from '../types';

// FIXME: Replace with correct interface
interface APIFeedback {}

function mutationSaveFeedback( {
	params,
	agencyId,
}: MutationSaveFeedbackVariables & { agencyId?: number } ): Promise< APIFeedback > {
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required to save feedback' );
	}
	// FIXME: Replace with correct path
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/feedback`,
		body: params,
	} );
}

export default function useSaveFeedbackMutation< TContext = unknown >(
	options?: UseMutationOptions< APIFeedback, Error, MutationSaveFeedbackVariables, TContext >
): UseMutationResult< APIFeedback, Error, MutationSaveFeedbackVariables, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	const isAPIEnabled = false; // FIXME: Remove this when API is enabled

	return useMutation< APIFeedback, Error, MutationSaveFeedbackVariables, TContext >( {
		...options,
		mutationFn: ( args ) =>
			isAPIEnabled
				? mutationSaveFeedback( { ...args, agencyId } )
				: Promise.resolve( {
						status: 200,
						code: 'success',
						message: 'Feedback saved',
				  } ), // FIXME: Remove this when API is enabled
	} );
}
