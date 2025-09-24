import {
	githubInstallationsQuery,
	githubRepositoriesQuery,
	githubRepositoryBranchesQuery,
	githubRepositoryChecksQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	ComboboxControl,
	RadioControl,
	SelectControl,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataForm, Field, type DataFormControlProps } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import { SectionHeader } from '../../components/section-header';
import { AdvancedWorkflowValidation } from './advanced-workflow-validation';
import { useCreateCodeDeployment } from './use-create-code-deployment';
import type { Site, GitHubInstallation, GitHubRepository } from '@automattic/api-core';

interface ConnectRepositoryFormProps {
	site: Site;
	onConnected: () => void;
	onCancel: () => void;
}

interface FormData {
	selectedInstallationId: number | '';
	selectedRepositoryId: number | '';
	branch: string;
	targetDir: string;
	isAutomated: boolean;
	deploymentMode: 'simple' | 'advanced';
	workflowPath: string | undefined;
}

// Custom repository selector component with search functionality
const RepositorySelector = ( {
	field,
	onChange,
	data,
	hideLabelFromVision,
}: DataFormControlProps< FormData > ) => {
	const { id, getValue } = field;
	const currentValue = getValue?.( { item: data } );

	// Get repository options from the field elements
	const repositoryOptions = field.elements || [];
	return (
		<ComboboxControl
			__next40pxDefaultSize
			allowReset
			label={ hideLabelFromVision ? '' : field.label }
			value={ currentValue === '' ? '' : currentValue?.toString() || '' }
			onChange={ ( value ) => {
				if ( ! value ) {
					onChange( { [ id ]: '' } );
					return;
				}
				onChange( { [ id ]: Number( value ) } );
			} }
			options={ repositoryOptions }
			placeholder={ __( 'Select a repository' ) }
		/>
	);
};

// Custom GitHub account selector with add button
const GitHubAccountSelector = ( { field, onChange, data }: DataFormControlProps< FormData > ) => {
	const { id, getValue } = field;

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between" alignment="center">
				<Text weight={ 500 } size="11" style={ { textTransform: 'uppercase' } }>
					{ __( 'GitHub account' ) }
				</Text>
				<Button variant="link">{ __( 'Add GitHub account' ) }</Button>
			</HStack>
			<SelectControl
				__next40pxDefaultSize
				aria-label={ __( 'GitHub account' ) }
				value={ getValue?.( { item: data } ) }
				onChange={ ( value ) => {
					onChange( { [ id ]: Number( value ) } );
				} }
				options={ field.elements || [] }
			/>
		</VStack>
	);
};

const AutomatedToggle = ( {
	field,
	onChange,
	data,
	hideLabelFromVision,
}: DataFormControlProps< FormData > ) => {
	const { id, getValue } = field;
	const currentValue = getValue?.( { item: data } );

	return (
		<ToggleControl
			label={ hideLabelFromVision ? '' : field.label }
			checked={ currentValue }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
		/>
	);
};

export const ConnectRepositoryForm = ( {
	site,
	onConnected,
	onCancel,
}: ConnectRepositoryFormProps ) => {
	const [ formData, setFormData ] = useState< FormData >( {
		selectedInstallationId: '',
		selectedRepositoryId: '',
		branch: '',
		targetDir: '/',
		isAutomated: false,
		deploymentMode: 'simple',
		workflowPath: '.github/workflows/wpcom.yml',
	} );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ isTargetDirDirty, setIsTargetDirDirty ] = useState( false );

	const { data: installations } = useSuspenseQuery( githubInstallationsQuery() );

	const selectedInstallation: GitHubInstallation | undefined = useMemo( () => {
		if ( formData.selectedInstallationId === '' ) {
			return installations[ 0 ];
		}
		return installations.find( ( inst ) => inst.external_id === formData.selectedInstallationId );
	}, [ installations, formData.selectedInstallationId ] );

	const { data: repositories = [], isLoading: isLoadingRepositories } = useQuery( {
		...githubRepositoriesQuery( selectedInstallation?.external_id ?? 0 ),
		enabled: !! selectedInstallation,
	} );

	const selectedRepository: GitHubRepository | undefined = useMemo( () => {
		if ( ! repositories || formData.selectedRepositoryId === '' ) {
			return undefined;
		}

		return repositories.find( ( repository ) => repository.id === formData.selectedRepositoryId );
	}, [ repositories, formData.selectedRepositoryId ] );

	useEffect( () => {
		if ( installations.length > 0 && formData.selectedInstallationId === '' ) {
			setFormData( ( prev ) => ( {
				...prev,
				selectedInstallationId: installations[ 0 ].external_id,
			} ) );
		}
	}, [ installations, formData.selectedInstallationId ] );

	useEffect( () => {
		if ( selectedRepository?.default_branch ) {
			setFormData( ( prev ) => ( { ...prev, branch: selectedRepository.default_branch } ) );
		} else if ( ! selectedRepository ) {
			setFormData( ( prev ) => ( { ...prev, branch: '' } ) );
		}
	}, [ selectedRepository ] );

	const { data: remoteBranches = [], isLoading: isLoadingBranches } = useQuery( {
		...githubRepositoryBranchesQuery(
			selectedInstallation?.external_id ?? 0,
			selectedRepository?.owner ?? '',
			selectedRepository?.name ?? ''
		),
		enabled: !! selectedInstallation && !! selectedRepository,
	} );

	const { data: repositoryChecks } = useQuery( {
		...githubRepositoryChecksQuery(
			selectedInstallation?.external_id ?? 0,
			selectedRepository?.owner ?? '',
			selectedRepository?.name ?? '',
			formData.branch
		),
		enabled: !! selectedInstallation && !! selectedRepository && !! formData.branch,
	} );

	const isAdvancedSelected = formData.deploymentMode === 'advanced';

	useEffect( () => {
		if ( ! repositoryChecks?.suggested_directory ) {
			return;
		}

		if ( isTargetDirDirty ) {
			return;
		}

		setFormData( ( prev ) => ( { ...prev, targetDir: repositoryChecks.suggested_directory } ) );
	}, [ repositoryChecks?.suggested_directory, isTargetDirDirty ] );

	const { createDeployment } = useCreateCodeDeployment( site.ID, {
		onSuccess: () => {
			onConnected();
		},
		onError: () => {
			setIsSubmitting( false );
		},
	} );

	const handleSubmit = async () => {
		if (
			! selectedRepository ||
			! selectedInstallation ||
			! formData.branch ||
			! formData.targetDir
		) {
			return;
		}

		setIsSubmitting( true );

		try {
			await createDeployment( {
				externalRepositoryId: selectedRepository.id,
				branchName: formData.branch,
				targetDir: formData.targetDir,
				installationId: selectedInstallation.external_id,
				isAutomated: formData.isAutomated,
				workflowPath: formData.workflowPath || '.github/workflows/wpcom.yml',
			} );
		} catch ( error ) {
			setIsSubmitting( false );
		}
	};

	const branchOptions = useMemo( () => {
		return remoteBranches.map( ( branchName ) => ( {
			label: branchName,
			value: branchName,
		} ) );
	}, [ remoteBranches ] );

	const installationOptions = useMemo( () => {
		return installations.map( ( installation ) => ( {
			label: installation.account_name,
			value: installation.external_id.toString(),
		} ) );
	}, [ installations ] );

	const repositoryOptions = useMemo( () => {
		return repositories.map( ( repo ) => ( {
			label: `${ repo.owner }/${ repo.name }`,
			value: repo.id.toString(),
		} ) );
	}, [ repositories ] );

	const installationHelpText =
		installations.length === 0 ? __( 'Add a GitHub account to select a repository.' ) : undefined;

	const repositoryHelpText = useMemo( () => {
		if ( ! selectedInstallation ) {
			return __( 'Select a GitHub account first.' );
		}

		if ( isLoadingRepositories ) {
			return __( 'Loading repositories…' );
		}

		if ( repositories.length === 0 ) {
			return __( 'No repositories available for this account.' );
		}

		return undefined;
	}, [ isLoadingRepositories, repositories, selectedInstallation ] );

	const isAdvancedValid = ! isAdvancedSelected || !! formData.workflowPath;
	const isFormValid = !! (
		selectedRepository &&
		selectedInstallation &&
		formData.branch &&
		formData.targetDir &&
		isAdvancedValid
	);

	const fields: Field< FormData >[] = useMemo( () => {
		return [
			{
				id: 'selectedInstallationId',
				label: __( 'GitHub account' ),
				type: 'text' as const,
				Edit: GitHubAccountSelector,
				elements: installationOptions,
				help: installationHelpText,
			},
			{
				id: 'selectedRepositoryId',
				label: __( 'Repository' ),
				type: 'text' as const,
				Edit: RepositorySelector,
				elements: repositoryOptions,
				help: repositoryHelpText,
			},
			{
				id: 'branch',
				label: __( 'Deployment Branch' ),
				type: 'text' as const,
				Edit: 'select',
				elements: branchOptions,
				help: isLoadingBranches
					? __( 'Loading branches…' )
					: __( 'Select the branch to deploy from this repository.' ),
				disabled: () => ! selectedRepository || isLoadingBranches,
			},
			{
				id: 'targetDir',
				label: __( 'Destination Directory' ),
				type: 'text' as const,
				help: __( 'This path is relative to the server root.' ),
				disabled: () => ! selectedRepository,
			},
			{
				id: 'isAutomated',
				label: __( 'Automated Deployments' ),
				type: 'text' as const,
				Edit: AutomatedToggle,
			},
		];
	}, [
		installationOptions,
		installationHelpText,
		repositoryOptions,
		repositoryHelpText,
		branchOptions,
		isLoadingBranches,
		selectedRepository,
	] );

	return (
		<VStack spacing={ 6 }>
			<SectionHeader
				title={ __( 'Configure repository connection' ) }
				description={ __(
					"Select a repository and choose where you'd like your files to deploy."
				) }
			/>

			<DataForm< FormData >
				data={ formData }
				fields={ fields }
				form={ {
					layout: { type: 'regular' as const },
					fields: [
						'selectedInstallationId',
						'selectedRepositoryId',
						'branch',
						'targetDir',
						'isAutomated',
					],
				} }
				onChange={ ( edits: Partial< FormData > ) => {
					const newFormData = { ...formData, ...edits };

					// Handle special cases for form field changes
					if ( 'selectedInstallationId' in edits ) {
						const installationId = edits.selectedInstallationId;
						if ( installationId === '' ) {
							newFormData.selectedInstallationId = installations[ 0 ]?.external_id || '';
						} else {
							newFormData.selectedInstallationId = Number( installationId );
						}

						// Reset dependent fields when installation changes
						newFormData.selectedRepositoryId = '';
						newFormData.branch = '';
						newFormData.targetDir = '/';
						newFormData.workflowPath = '.github/workflows/wpcom.yml';
						setIsTargetDirDirty( false );
					}

					if ( 'selectedRepositoryId' in edits ) {
						const repositoryId = edits.selectedRepositoryId;
						if ( repositoryId === '' ) {
							newFormData.selectedRepositoryId = '';
						} else {
							newFormData.selectedRepositoryId = Number( repositoryId );
						}
					}

					if ( 'targetDir' in edits ) {
						const trimmedValue = edits.targetDir?.trim() || '';
						let normalisedValue = '/';
						if ( trimmedValue ) {
							if ( trimmedValue.startsWith( '/' ) ) {
								normalisedValue = trimmedValue;
							} else {
								normalisedValue = `/${ trimmedValue }`;
							}
						}
						newFormData.targetDir = normalisedValue;
						setIsTargetDirDirty( true );
					}

					setFormData( newFormData );
				} }
			/>

			<SectionHeader
				title={ __( 'Pick your deployment mode' ) }
				description={ __(
					'Simple deployments copy repository files to a directory, while advanced deployments use scripts for custom build steps and testing.'
				) }
			/>

			<RadioControl
				selected={ formData.deploymentMode }
				onChange={ ( value ) =>
					setFormData( ( prev ) => ( { ...prev, deploymentMode: value as 'simple' | 'advanced' } ) )
				}
				options={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Advanced' ), value: 'advanced' },
				] }
				disabled={ ! selectedRepository }
			/>

			{ isAdvancedSelected && (
				<AdvancedWorkflowValidation
					selectedInstallationId={ selectedInstallation?.external_id ?? 0 }
					repository={ selectedRepository }
					branchName={ formData.branch }
					workflowPath={ formData.workflowPath }
					onWorkflowPathChange={ ( workflowPath ) =>
						setFormData( ( prev ) => ( { ...prev, workflowPath } ) )
					}
					disabled={ ! selectedRepository }
				/>
			) }

			<HStack justify="flex-end">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleSubmit }
					isBusy={ isSubmitting }
					disabled={ ! isFormValid || isSubmitting }
					__next40pxDefaultSize
				>
					{ __( 'Connect Repository' ) }
				</Button>
			</HStack>
		</VStack>
	);
};
