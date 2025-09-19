import { CodeDeploymentData } from '@automattic/api-core';
import { codeDeploymentDeleteMutation, codeDeploymentsQuery } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	__experimentalText as Text,
	ExternalLink,
	ToggleControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import type { Field } from '@wordpress/dataviews';

interface DisconnectRepositoryModalProps {
	deployment: CodeDeploymentData;
	onClose?: () => void;
}

export function DisconnectRepositoryModalContent( {
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

	const handleRemoveFilesChange = ( { enabled }: { enabled?: boolean } ) => {
		setRemoveFilesChecked( !! enabled );
	};

	const fields: Field< { enabled: boolean } >[] = [
		{
			id: 'enabled',
			label: __( 'Remove associated files from my WordPress.com site' ),
			Edit: ( { field, onChange, data } ) => {
				const { id, label, getValue } = field;

				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={ label }
						checked={ getValue( { item: data } ) }
						disabled={ isDisconnecting }
						onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
					/>
				);
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'enabled' ],
	};

	const data = { enabled: removeFilesChecked };

	if ( ! deployment ) {
		return null;
	}

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						/* translators: name of repository in the format repository-owner/repository-name */
						__( 'You are about to disconnect your repository <repositoryName />' ),
						{
							repositoryName: (
								<ExternalLink href={ `https://github.com/${ deployment.repository_name }` }>
									{ deployment.repository_name }
								</ExternalLink>
							),
						}
					) }
				</Text>

				<Text>
					{ __(
						'By default, the existing files will remain on the associated WordPress.com site, but you have the option to remove them. Note that removing the files won’t affect your repository.'
					) }
				</Text>

				<DataForm< { enabled: boolean } >
					data={ data }
					fields={ fields }
					form={ form }
					onChange={ handleRemoveFilesChange }
				/>
			</VStack>
			<ButtonStack alignment="right">
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
			</ButtonStack>
		</VStack>
	);
}
