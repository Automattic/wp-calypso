import { Button, Modal, SelectControl, __experimentalText as Text } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { CodeDeploymentData } from '../../../../sites/deployments/deployments/use-code-deployments-query';
import { useCreateCodeDeploymentRun } from '../../../../sites/deployments/deployments/use-create-code-deployment-run';

interface TriggerDeploymentModalProps {
	onClose: () => void;
	deployments: CodeDeploymentData[];
}

export default function TriggerDeploymentModal( {
	onClose,
	deployments,
}: TriggerDeploymentModalProps ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ selectedDeployment, setSelectedDeployment ] = useState< CodeDeploymentData | null >(
		null
	);

	const { triggerManualDeployment } = useCreateCodeDeploymentRun(
		selectedDeployment?.blog_id || 0,
		selectedDeployment?.id || 0
	);

	const handleDeploy = async () => {
		if ( ! selectedDeployment ) {
			return;
		}

		triggerManualDeployment();
		createSuccessNotice( __( 'Deployment run created.' ), { type: 'snackbar' } );
		onClose();
	};

	return (
		<Modal title={ __( 'Trigger manual deploy' ) } onRequestClose={ onClose } size="medium">
			<div style={ { display: 'flex', flexDirection: 'column', gap: '16px' } }>
				<Text as="p" variant="muted">
					{ __(
						"You're about to deploy changes from the selected repository to your production site. This will update the deployed files and may affect your live site."
					) }
				</Text>

				<SelectControl
					label={ __( 'Choose repository to deploy' ) }
					value={ selectedDeployment?.id.toString() }
					__next40pxDefaultSize
					options={ [
						{ label: __( 'Select a repository' ), value: '' },
						...deployments.map( ( deployment ) => ( {
							label: deployment.repository_name,
							value: deployment.id.toString(),
						} ) ),
					] }
					onChange={ ( value ) => {
						if ( value ) {
							setSelectedDeployment(
								deployments?.find( ( deployment ) => deployment.id.toString() === value ) || null
							);
						} else {
							setSelectedDeployment( null );
						}
					} }
				/>

				<div style={ { display: 'flex', justifyContent: 'flex-end', gap: '8px' } }>
					<Button variant="tertiary" onClick={ onClose } __next40pxDefaultSize>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleDeploy }
						disabled={ ! selectedDeployment }
						__next40pxDefaultSize
					>
						{ __( 'Deploy to production' ) }
					</Button>
				</div>
			</div>
		</Modal>
	);
}
