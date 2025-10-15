import { createCodeDeploymentRunMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	SelectControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, NormalizedField } from '@wordpress/dataviews';
import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { CodeDeploymentData } from '../../../sites/deployments/deployments/use-code-deployments-query';
import { ButtonStack } from '../../components/button-stack';

interface TriggerDeploymentModalFormProps {
	deployments: CodeDeploymentData[];
	repositoryId?: string;
	onClose?: () => void;
	onSuccess?: () => void;
}
interface DeploymentFormData {
	selectedDeploymentId: string;
}

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'selectedDeploymentId' ],
};

export interface DeploymentSelectControlProps {
	data: DeploymentFormData;
	field: NormalizedField< DeploymentFormData >;
	onChange: ( edits: Partial< DeploymentFormData > ) => void;
}

function DeploymentSelectControl( { data, field, onChange }: DeploymentSelectControlProps ) {
	const { id, label, elements, getValue } = field;

	const options = [ { label: __( 'Select a repository' ), value: '' }, ...( elements ?? [] ) ];

	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ label }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
			options={ options }
			value={ getValue( { item: data } ) }
		/>
	);
}

export function TriggerDeploymentModalForm( {
	onClose,
	deployments,
	repositoryId,
	onSuccess,
}: TriggerDeploymentModalFormProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ deploymentFormData, setDeploymentFormData ] = useState< DeploymentFormData >( {
		selectedDeploymentId: repositoryId ?? '',
	} );

	const selectedDeployment: CodeDeploymentData | null = useMemo( () => {
		if ( ! deploymentFormData.selectedDeploymentId ) {
			return null;
		}

		return (
			deployments.find(
				( deployment ) => deployment.id.toString() === deploymentFormData.selectedDeploymentId
			) || null
		);
	}, [ deploymentFormData.selectedDeploymentId, deployments ] );

	const { mutate: createCodeDeploymentRun, isPending: isCreatingCodeDeploymentRun } = useMutation(
		createCodeDeploymentRunMutation()
	);

	const fields: Field< DeploymentFormData >[] = [
		{
			Edit: DeploymentSelectControl,
			id: 'selectedDeploymentId',
			label: __( 'Choose repository to deploy' ),
			elements: deployments.map( ( deployment ) => ( {
				label: deployment.repository_name,
				value: deployment.id.toString(),
			} ) ),
		},
	];

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! selectedDeployment ) {
			return;
		}

		createCodeDeploymentRun(
			{
				siteId: selectedDeployment.blog_id,
				deploymentId: selectedDeployment.id,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Deployment run created.' ), { type: 'snackbar' } );
					onClose?.();
					onSuccess?.();
				},
				onError: ( error ) => {
					createErrorNotice( error.message, { type: 'snackbar' } );
				},
			}
		);
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<Text as="p">
					{ __(
						'You’re about to deploy changes from the selected repository to your production site. This will update the deployed files and may affect your live site.'
					) }
				</Text>

				<DataForm< DeploymentFormData >
					data={ deploymentFormData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< DeploymentFormData > ) => {
						setDeploymentFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>

				<ButtonStack justify="flex-end">
					<Button variant="tertiary" onClick={ onClose } __next40pxDefaultSize>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						type="submit"
						disabled={ ! selectedDeployment || isCreatingCodeDeploymentRun }
						__next40pxDefaultSize
					>
						{ __( 'Deploy to production' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
