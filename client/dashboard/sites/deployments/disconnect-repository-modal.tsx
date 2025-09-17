import { CodeDeploymentData } from '@automattic/api-core';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Modal,
	ToggleControl,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';

interface DisconnectRepositoryModalProps {
	deployment: CodeDeploymentData;
	onDisconnect: () => void;
	onClose: () => void;
	isDisconnecting: boolean;
}

export function DisconnectRepositoryModal( {
	deployment,
	onDisconnect,
	onClose,
	isDisconnecting,
}: DisconnectRepositoryModalProps ) {
	const [ removeFilesChecked, setRemoveFilesChecked ] = useState( false );
	return (
		<Modal title={ __( 'Disconnect repository' ) } onRequestClose={ onClose } size="medium">
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

				<HStack alignment="right">
					<Button variant="tertiary" onClick={ onClose } __next40pxDefaultSize>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						isDestructive
						onClick={ onDisconnect }
						disabled={ isDisconnecting }
						__next40pxDefaultSize
					>
						{ __( 'Disconnect repository' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
