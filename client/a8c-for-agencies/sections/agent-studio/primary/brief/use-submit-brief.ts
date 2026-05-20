import pageRouter from '@automattic/calypso-router';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import { getAgentStudioPath } from '../../lib/paths';

/**
 * Wraps the create-output mutation with the shared success and error handling
 * that every agent brief form needs: a Tracks event, a notice, and a redirect
 * back to the deliverables list.
 * @param agentId - The agent the brief is being submitted to.
 * @returns The create-output mutation.
 */
export default function useSubmitBrief( agentId: string ) {
	const dispatch = useDispatch();

	return useCreateAgentStudioOutput( {
		onSuccess: ( output ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_output_created', {
					agent_id: agentId,
					output_id: output.id,
				} )
			);
			dispatch(
				successNotice(
					sprintf(
						/* translators: %s is an agent name. */
						__( '%s is on it. Your deliverable is generating.' ),
						output.agentName
					),
					{ duration: 5000 }
				)
			);
			pageRouter( getAgentStudioPath() );
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not start the deliverable. Please try again.' ) ) );
		},
	} );
}
