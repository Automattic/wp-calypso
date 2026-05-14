import { __, sprintf } from '@wordpress/i18n';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useDeleteAgentStudioProject from '../../data/use-delete-agent-studio-project';
import type { AgentStudioProject } from '../../types';

interface Props {
	project: AgentStudioProject;
	onClose: () => void;
	onDeleted: () => void;
}

export default function DeleteProjectDialog( { project, onClose, onDeleted }: Props ) {
	const dispatch = useDispatch();

	const mutation = useDeleteAgentStudioProject( {
		onSuccess: () => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_project_deleted', {
					project_id: project.id,
				} )
			);
			dispatch(
				successNotice(
					sprintf(
						/* translators: %s is a project name. */
						__( '“%s” has been deleted.' ),
						project.name
					),
					{ duration: 4000 }
				)
			);
			onDeleted();
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not delete the project. Please try again.' ) ) );
		},
	} );

	return (
		<A4AConfirmationDialog
			title={ sprintf(
				/* translators: %s is a project name. */
				__( 'Delete “%s”?' ),
				project.name
			) }
			ctaLabel={ __( 'Delete project' ) }
			onClose={ onClose }
			onConfirm={ () => mutation.mutate( project.id ) }
			isLoading={ mutation.isPending }
			isDestructive
		>
			<p>
				{ __(
					'This permanently deletes the project and every output inside it. This can’t be undone.'
				) }
			</p>
		</A4AConfirmationDialog>
	);
}
