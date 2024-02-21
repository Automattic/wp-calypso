import { Dialog } from '@automattic/components';
import { ExternalLink, ToggleControl } from '@wordpress/components';
import { createInterpolateElement, useMemo, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import { CodeDeploymentData } from './use-code-deployments-query';
import { useDeleteCodeDeployment } from './use-delete-code-deployment';

interface DeleteDeploymentDialogProps {
	deployment: CodeDeploymentData;
	isVisible: boolean;
	onClose(): void;
}

export const DeleteDeploymentDialog = ( {
	deployment,
	isVisible,
	onClose,
}: DeleteDeploymentDialogProps ) => {
	const { __ } = useI18n();

	const [ removeFiles, setRemoveFiles ] = useState( false );

	const { deleteDeployment, isPending } = useDeleteCodeDeployment(
		deployment.blog_id,
		deployment.id
	);

	const dialogActions = useMemo( () => {
		const actions: ComponentProps< typeof Dialog >[ 'buttons' ] = [
			{
				busy: isPending,
				disabled: isPending,
				action: 'delete',
				label: __( 'Disconnect repository' ),
				isPrimary: true,
				scary: true,
				onClick: async ( closeModal ) => {
					await deleteDeployment( { removeFiles } );
					closeModal();
				},
			},
		];

		return actions;
	}, [ __, isPending, deleteDeployment, removeFiles ] );

	return (
		<Dialog
			showCloseIcon={ ! isPending }
			isVisible={ isVisible }
			buttons={ dialogActions }
			shouldCloseOnOverlayClick={ ! isPending }
			shouldCloseOnEsc={ ! isPending }
			onClose={ isPending ? undefined : onClose }
		>
			<div className="github-deployments-delete-deployment-dialog">
				<h1>{ __( 'Disconnect repository' ) }</h1>
				<p css={ { marginTop: '24px' } }>
					{ createInterpolateElement(
						sprintf(
							/* translators: the colorsNum could be any number from 0 to about ~10 */
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
				</p>
				<p>
					{ __(
						'By default, the existing files will remain on the associated WordPress.com site, but you have the option to remove them. Note that removing the files won’t affect your repository.'
					) }
				</p>
				<ToggleControl
					onChange={ setRemoveFiles }
					__nextHasNoMarginBottom
					checked={ removeFiles }
					label={ __( 'Remove associated files from my WordPress.com site' ) }
				/>
			</div>
		</Dialog>
	);
};
