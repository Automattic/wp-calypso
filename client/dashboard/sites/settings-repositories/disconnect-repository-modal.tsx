import { CodeDeploymentData } from '@automattic/api-core';
import { codeDeploymentDeleteMutation, codeDeploymentsQuery } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	ToggleControl,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';

interface DisconnectRepositoryModalProps {
	deployment: CodeDeploymentData;
	onClose?: () => void;
}

export function DisconnectRepositoryModal( {
	deployment,
	onClose,
}: DisconnectRepositoryModalProps ) {
	const queryClient = useQueryClient();
	const [ removeFilesChecked, setRemoveFilesChecked ] = useState( false );

	const { mutate: deleteDeployment, isPending: isDisconnecting } = useMutation( {
		...codeDeploymentDeleteMutation( deployment?.blog_id, deployment?.id ),
		meta: {
			snackbar: {
				success: __( 'Repository disconnected.' ),
				error: __( 'Failed to disconnect repository.' ),
			},
		},
	} );

	const handleDisconnect = () => {
		deleteDeployment( removeFilesChecked, {
			onSuccess: async () => {
				await queryClient.invalidateQueries( codeDeploymentsQuery( deployment.blog_id ) );
				onClose?.();
			},
		} );
	};

	if ( ! deployment ) {
		return null;
	}

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						sprintf(
							/* translators: name of repository in the format repository-owner/repository-name */
							__( 'You are about to disconnect your repository <a>%(repositoryName)s</a>' ),
							{ repositoryName: deployment.repository_name }
						),
						{
							a: (
								<ExternalLink
									children={ null }
									href={ `https://github.com/${ deployment.repository_name }` }
								/>
							),
						}
					) }
				</Text>

				<Text>
					{ __(
						'By default, the existing files will remain on the associated WordPress.com site, but you have the option to remove them. Note that removing the files won’t affect your repository.'
					) }
				</Text>

				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Remove associated files from my WordPress.com site' ) }
					checked={ removeFilesChecked }
					onChange={ () => setRemoveFilesChecked( ( value ) => ! value ) }
				/>
			</VStack>
			<HStack alignment="right">
				<Button variant="tertiary" onClick={ onClose } __next40pxDefaultSize>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={ handleDisconnect }
					isBusy={ isDisconnecting }
					__next40pxDefaultSize
				>
					{ __( 'Disconnect repository' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
