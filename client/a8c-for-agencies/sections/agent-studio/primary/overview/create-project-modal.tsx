import {
	Button,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioProject from '../../data/use-create-agent-studio-project';
import type { FormEvent } from 'react';

interface Props {
	onClose: () => void;
	onCreated: ( projectId: string ) => void;
}

export default function CreateProjectModal( { onClose, onCreated }: Props ) {
	const dispatch = useDispatch();
	const [ name, setName ] = useState( '' );

	const mutation = useCreateAgentStudioProject( {
		onSuccess: ( project ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_project_created', {
					project_id: project.id,
				} )
			);
			onCreated( project.id );
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not create the project. Please try again.' ) ) );
		},
	} );

	const onSubmit = ( event: FormEvent ) => {
		event.preventDefault();
		const trimmedName = name.trim();

		if ( ! trimmedName ) {
			return;
		}

		mutation.mutate( { name: trimmedName } );
	};

	return (
		<Modal
			title={ __( 'Create project' ) }
			onRequestClose={ onClose }
			className="a4a-agent-studio-create-project-modal"
		>
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<TextControl
						label={ __( 'Project name' ) }
						value={ name }
						onChange={ setName }
						placeholder={ __( 'WCEU launch campaign' ) }
						disabled={ mutation.isPending }
						__nextHasNoMarginBottom
					/>
					<HStack justify="flex-end" spacing={ 2 }>
						<Button variant="tertiary" onClick={ onClose } disabled={ mutation.isPending }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={ ! name.trim() || mutation.isPending }
							isBusy={ mutation.isPending }
						>
							{ __( 'Create project' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Modal>
	);
}
