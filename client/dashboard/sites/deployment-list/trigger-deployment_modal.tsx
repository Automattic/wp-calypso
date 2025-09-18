import {
	Button,
	Modal,
	SelectControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { CodeDeploymentData } from '../../../../sites/deployments/deployments/use-code-deployments-query';
import { useCreateCodeDeploymentRun } from '../../../../sites/deployments/deployments/use-create-code-deployment-run';

interface TriggerDeploymentModalProps {
	onClose: () => void;
	deployments: CodeDeploymentData[];
}

export function TriggerDeploymentModal( { onClose, deployments }: TriggerDeploymentModalProps ) {
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
			<VStack spacing={ 4 }>
				<Text as="p">
					{ __(
						'You’re about to deploy changes from the selected repository to your production site. This will update the deployed files and may affect your live site.'
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

				<HStack spacing={ 2 } style={ { justifyContent: 'flex-end' } }>
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
				</HStack>
			</VStack>
		</Modal>
	);
}
