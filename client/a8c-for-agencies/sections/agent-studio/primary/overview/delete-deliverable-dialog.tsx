import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useDeleteAgentStudioOutput from '../../data/use-delete-agent-studio-output';
import type { AgentStudioOutput } from '../../types';

interface Props {
	output: AgentStudioOutput;
	onClose: () => void;
	onDeleted: () => void;
}

export default function DeleteDeliverableDialog( { output, onClose, onDeleted }: Props ) {
	const dispatch = useDispatch();

	const mutation = useDeleteAgentStudioOutput( {
		onSuccess: () => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_output_deleted', {
					output_id: output.id,
				} )
			);
			dispatch(
				successNotice(
					sprintf(
						/* translators: %s is a deliverable title. */
						__( '“%s” has been deleted.' ),
						output.title
					),
					{ duration: 4000 }
				)
			);
			onDeleted();
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not delete the deliverable. Please try again.' ) ) );
		},
	} );

	return (
		<A4AConfirmationDialog
			title={ sprintf(
				/* translators: %s is a deliverable title. */
				__( 'Delete “%s”?' ),
				output.title
			) }
			ctaLabel={ __( 'Delete deliverable' ) }
			onClose={ onClose }
			onConfirm={ () => mutation.mutate( output.id ) }
			isLoading={ mutation.isPending }
			isDestructive
		>
			<Text>{ __( 'This permanently deletes the deliverable. This can’t be undone.' ) }</Text>
		</A4AConfirmationDialog>
	);
}
