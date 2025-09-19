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

type DisconnectRepositoryFormData = {
	removeFiles?: boolean;
};

export function DisconnectRepositoryModalContent( {
	deployment,
	onClose,
}: DisconnectRepositoryModalProps ) {
	const queryClient = useQueryClient();
	const [ formData, setFormData ] = useState< DisconnectRepositoryFormData >( {
		removeFiles: false,
	} );

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
		deleteDeployment( !! formData.removeFiles, {
			onSuccess: async () => {
				await queryClient.invalidateQueries( codeDeploymentsQuery( deployment.blog_id ) );
				onClose?.();
			},
		} );
	};

	const fields: Field< DisconnectRepositoryFormData >[] = [
		{
			id: 'removeFiles',
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
		fields: [ 'removeFiles' ],
	};

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

				<DataForm< DisconnectRepositoryFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< DisconnectRepositoryFormData > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
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
