import {
	githubInstallationsQuery,
	githubRepositoriesQuery,
	githubRepositoryBranchesQuery,
	githubRepositoryChecksQuery,
	githubWorkflowsQuery,
	siteBySlugQuery,
	codeDeploymentsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, UseMutationResult } from '@tanstack/react-query';
import {
	Button,
	ComboboxControl,
	RadioControl,
	SelectControl,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
	Spinner,
} from '@wordpress/components';
import { DataForm, Field, type DataFormControlProps } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { siteRoute } from '../../app/router/sites';
import { SectionHeader } from '../../components/section-header';
import { AdvancedWorkflowStyle } from './advanced-workflow-style';
import { useInstallGithub } from './use-install-github';
import type {
	GitHubInstallation,
	GitHubRepository,
	CreateAndUpdateCodeDeploymentVariables,
	CreateAndUpdateCodeDeploymentResponse,
} from '@automattic/api-core';

interface ConnectRepositoryFormProps {
	onCancel: () => void;
	mutation: UseMutationResult<
		CreateAndUpdateCodeDeploymentResponse,
		Error,
		CreateAndUpdateCodeDeploymentVariables,
		unknown
	>;
	initialValues: ConnectRepositoryFormData;
	submitText: string;
}

export interface ConnectRepositoryFormData {
	selectedInstallationId: number | '';
	selectedRepositoryId: number | '';
	branch: string;
	targetDir: string;
	isAutomated: boolean;
	deploymentMode: 'simple' | 'advanced';
	workflowPath: string;
}

// Custom repository selector component with search functionality
const RepositorySelector = ( {
	field,
	onChange,
	data,
}: DataFormControlProps< ConnectRepositoryFormData > ) => {
	const { id, getValue } = field;
	const currentValue = getValue?.( { item: data } );

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between" alignment="center">
				<Text weight={ 500 } size="11" style={ { textTransform: 'uppercase' } }>
					{ __( 'Repository' ) }
				</Text>
				<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/github-deployments/create-repo-existing-source/">
					{ __( 'Create a new repository' ) }
				</ExternalLink>
			</HStack>
			<ComboboxControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				allowReset
				value={ currentValue === '' ? '' : currentValue?.toString() || '' }
				onChange={ ( value ) => {
					if ( ! value ) {
						onChange( { [ id ]: '' } );
						return;
					}
					onChange( { [ id ]: Number( value ) } );
				} }
				options={ field.elements || [] }
				placeholder={ __( 'Select a repository' ) }
				__experimentalRenderItem={ ( { item } ) => {
					if ( item.private ) {
						return (
							<HStack alignment="left" spacing={ 1 }>
								<Text style={ { color: 'currentColor' } }>{ item.label }</Text>
								<Icon
									icon={ lock }
									size={ 16 }
									style={ {
										fill: 'currentColor',
									} }
								/>
							</HStack>
						);
					}
					return <Text style={ { color: 'currentColor' } }>{ item.label }</Text>;
				} }
			/>
		</VStack>
	);
};

type GitHubAccountSelectorProps = DataFormControlProps< ConnectRepositoryFormData > & {
	onAddGitHubAccount: () => void;
};

const GitHubAccountSelector = ( {
	field,
	onChange,
	data,
	onAddGitHubAccount,
}: GitHubAccountSelectorProps ) => {
	const { id, getValue } = field;

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between" alignment="center">
				<Text weight={ 500 } size="11" style={ { textTransform: 'uppercase' } }>
					{ __( 'GitHub account' ) }
				</Text>
				<Button variant="link" onClick={ onAddGitHubAccount }>
					{ __( 'Add GitHub account' ) }
				</Button>
			</HStack>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				aria-label={ __( 'GitHub account' ) }
				value={ getValue?.( { item: data } ) }
				onChange={ ( value ) => {
					onChange( { [ id ]: Number( value ) } );
				} }
				options={
					field.elements?.length
						? field.elements
						: [ { label: __( 'Select a GitHub account' ), value: '' } ]
				}
			/>
		</VStack>
	);
};

const AutomatedToggle = ( {
	field,
	onChange,
	data,
	hideLabelFromVision,
}: DataFormControlProps< ConnectRepositoryFormData > ) => {
	const { id, getValue } = field;
	const currentValue = getValue?.( { item: data } );

	return (
		<ToggleControl
			__nextHasNoMarginBottom
			label={ hideLabelFromVision ? '' : field.label }
			checked={ currentValue }
			onChange={ ( value ) => onChange( { [ id ]: value } ) }
		/>
	);
};

export const ConnectRepositoryForm = ( {
	onCancel,
	mutation,
	initialValues,
	submitText,
}: ConnectRepositoryFormProps ) => {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const {
		data: installations = [],
		refetch: refetchGithubInstallations,
		error: githubInstallationsError,
		isLoading: isLoadingInstallations,
	} = useQuery( githubInstallationsQuery() );
	const [ formData, setFormData ] = useState< ConnectRepositoryFormData >( initialValues );
	const { installGithub } = useInstallGithub();

	const selectedInstallation: GitHubInstallation | undefined = useMemo( () => {
		if ( ! installations.length ) {
			return;
		}
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

	const { data: remoteBranches = [], isLoading: isLoadingBranches } = useQuery( {
		...githubRepositoryBranchesQuery(
			selectedInstallation?.external_id ?? 0,
			selectedRepository?.owner ?? '',
			selectedRepository?.name ?? ''
		),
		enabled: !! selectedInstallation && !! selectedRepository,
	} );

	const { data: existingDeployments = [] } = useQuery( codeDeploymentsQuery( site.ID ) );

	const connectedBranchesForSelectedRepo = useMemo( () => {
		if ( ! selectedRepository ) {
			return new Set< string >();
		}
		const connected = existingDeployments
			.filter( ( d ) => d.external_repository_id === selectedRepository.id )
			.map( ( d ) => d.branch_name );
		return new Set( connected );
	}, [ existingDeployments, selectedRepository ] );

	const { data: workflows = [] } = useQuery( {
		...githubWorkflowsQuery(
			selectedRepository?.owner ?? '',
			selectedRepository?.name ?? '',
			formData.branch
		),
		select: ( workflows ) => {
			// Filter out child workflows (lint files)
			const childWorkflows = [ 'lint-css.yml', 'lint-js.yml', 'lint-php.yml' ];
			return workflows.filter( ( workflow ) => ! childWorkflows.includes( workflow.file_name ) );
		},
		enabled: !! selectedRepository && !! formData.branch,
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

	const handleChange = ( updates: Partial< ConnectRepositoryFormData > ) => {
		setFormData( ( prev ) => {
			const newFormData = { ...prev, ...updates };

			if ( 'targetDir' in updates ) {
				const trimmedValue = updates.targetDir?.trim() || '';
				newFormData.targetDir = trimmedValue.startsWith( '/' )
					? trimmedValue
					: `/${ trimmedValue }`;
			}

			if ( 'deploymentMode' in updates ) {
				if ( updates.deploymentMode === 'simple' ) {
					newFormData.workflowPath = '';
				} else if (
					updates.deploymentMode === 'advanced' &&
					! newFormData.workflowPath &&
					workflows.length > 0
				) {
					newFormData.workflowPath = workflows[ 0 ].workflow_path;
				}
			}

			if ( 'selectedRepositoryId' in updates ) {
				newFormData.branch = '';
				newFormData.targetDir = '';

				// If repository is unselected, reset to simple mode since advanced requires a repo
				if ( updates.selectedRepositoryId === '' ) {
					newFormData.deploymentMode = 'simple';
					newFormData.workflowPath = '';
				} else {
					// When a repository is selected, consider auto-selecting its default branch
					const newlySelectedRepo = repositories.find(
						( repo ) => repo.id === updates.selectedRepositoryId
					);
					const defaultBranch = newlySelectedRepo?.default_branch;
					if ( defaultBranch ) {
						const connectedForNewRepo = new Set(
							existingDeployments
								.filter( ( d ) => d.external_repository_id === updates.selectedRepositoryId )
								.map( ( d ) => d.branch_name )
						);
						if ( ! connectedForNewRepo.has( defaultBranch ) ) {
							newFormData.branch = defaultBranch;
						}
					}
				}
			}

			return newFormData;
		} );
	};

	useEffect( () => {
		if ( ! repositoryChecks?.suggested_directory ) {
			return;
		}

		// Only update target directory when repository changes, not when branch changes
		setFormData( ( prev ) => ( { ...prev, targetDir: repositoryChecks.suggested_directory } ) );
	}, [ repositoryChecks?.suggested_directory, selectedRepository?.id ] );

	const handleSubmit = async () => {
		if (
			! selectedRepository ||
			! selectedInstallation ||
			! formData.branch ||
			! formData.targetDir
		) {
			return;
		}

		const mutationData: CreateAndUpdateCodeDeploymentVariables = {
			external_repository_id: selectedRepository.id,
			branch_name: formData.branch,
			target_dir: formData.targetDir,
			installation_id: selectedInstallation.external_id,
			is_automated: formData.isAutomated,
		};

		if ( formData.deploymentMode === 'advanced' ) {
			mutationData.workflow_path = formData.workflowPath || '.github/workflows/wpcom.yml';
		}

		await mutation.mutateAsync( mutationData );
	};

	const branchOptions = useMemo( () => {
		if ( ! remoteBranches ) {
			return [];
		}

		return remoteBranches.map( ( branchName ) => {
			const isConnected = connectedBranchesForSelectedRepo.has( branchName );
			return {
				label: isConnected ? `${ branchName } ${ __( '(already connected)' ) }` : branchName,
				value: branchName,
				disabled: isConnected,
			} as const;
		} );
	}, [ remoteBranches, connectedBranchesForSelectedRepo ] );

	const allBranchesConnected = useMemo( () => {
		if ( ! remoteBranches || remoteBranches.length === 0 ) {
			return false;
		}
		return remoteBranches.every( ( branchName ) =>
			connectedBranchesForSelectedRepo.has( branchName )
		);
	}, [ remoteBranches, connectedBranchesForSelectedRepo ] );

	const isDuplicateSelection = useMemo( () => {
		if ( ! selectedRepository || ! formData.branch ) {
			return false;
		}
		return connectedBranchesForSelectedRepo.has( formData.branch );
	}, [ connectedBranchesForSelectedRepo, selectedRepository, formData.branch ] );

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
			private: repo.private,
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

	const isAdvancedValid =
		! isAdvancedSelected ||
		( !! formData.workflowPath && formData.workflowPath !== 'CREATE_WORKFLOW_OPTION' );
	const isFormValid = !! (
		selectedRepository &&
		selectedInstallation &&
		formData.branch &&
		formData.targetDir &&
		isAdvancedValid &&
		! isDuplicateSelection
	);

	const handleAddGitHubAccount = useCallback( () => {
		installGithub( {
			onSuccess: async ( installationId: number ) => {
				const { data: newInstallations } = await refetchGithubInstallations();

				const newInstallation = newInstallations?.find(
					( installation ) => installation.external_id === installationId
				);

				if ( newInstallation ) {
					setFormData( ( prev ) => ( {
						...prev,
						selectedInstallationId: newInstallation.external_id,
					} ) );
				}
			},
		} );
	}, [ refetchGithubInstallations, installGithub ] );

	const renderAdvancedWorkflow = () => {
		if ( ! selectedRepository ) {
			return null;
		}

		return (
			<AdvancedWorkflowStyle
				repository={ selectedRepository }
				branchName={ formData.branch }
				workflowPath={ formData.workflowPath }
				workflows={ workflows }
				onWorkflowCreation={ ( workflowPath ) => handleChange( { workflowPath } ) }
				onChooseWorkflow={ ( workflowPath ) => handleChange( { workflowPath } ) }
				isLoading={ isLoadingRepositories }
				useComposerWorkflow={ !! repositoryChecks?.has_composer && ! repositoryChecks?.has_vendor }
			/>
		);
	};

	const fields: Field< ConnectRepositoryFormData >[] = useMemo( () => {
		return [
			{
				id: 'selectedInstallationId',
				label: __( 'GitHub account' ),
				type: 'text' as const,
				Edit: ( props ) => {
					return (
						<GitHubAccountSelector { ...props } onAddGitHubAccount={ handleAddGitHubAccount } />
					);
				},
				elements: installationOptions,
				description: installationHelpText,
			},
			{
				id: 'selectedRepositoryId',
				label: __( 'Repository' ),
				type: 'text' as const,
				Edit: RepositorySelector,
				elements: repositoryOptions,
				description: repositoryHelpText,
			},
			{
				id: 'branch',
				label: __( 'Deployment branch' ),
				type: 'text' as const,
				Edit: 'select',
				elements: branchOptions,
				description: ( () => {
					if ( isLoadingBranches ) {
						return __( 'Loading branches…' );
					}
					if ( allBranchesConnected ) {
						return __(
							'All branches for this repository are already connected. Please create a new branch or select a different repository.'
						);
					}
					return __( 'Select the branch to deploy from this repository.' );
				} )(),
			},
			{
				id: 'targetDir',
				label: __( 'Destination directory' ),
				type: 'text' as const,
				description: __( 'This path is relative to the server root.' ),
			},
			{
				id: 'isAutomated',
				label: __( 'Automated deployments' ),
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
		handleAddGitHubAccount,
		allBranchesConnected,
	] );

	if ( isLoadingInstallations ) {
		return (
			<HStack alignment="center">
				<Spinner />
			</HStack>
		);
	}

	if ( githubInstallationsError ) {
		return (
			<VStack spacing={ 6 }>
				<SectionHeader
					title={ __( 'Install the WordPress.com app on GitHub' ) }
					description={ __(
						'To access your repositories, install the WordPress.com app on your GitHub account and grant it the necessary permissions.'
					) }
				/>
				<HStack alignment="center">
					<Button variant="primary" onClick={ handleAddGitHubAccount }>
						{ __( 'Install the WordPress.com app' ) }
					</Button>
				</HStack>
			</VStack>
		);
	}

	return (
		<>
			<DataForm< ConnectRepositoryFormData >
				// Force a re-render when the repository changes
				// Otherwise, the fields that have validation errors will not be reset
				key={ formData.selectedRepositoryId }
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
				onChange={ handleChange }
			/>

			<SectionHeader
				level={ 3 }
				title={ __( 'Pick your deployment mode' ) }
				description={ __(
					'Simple deployments copy repository files to a directory, while advanced deployments use scripts for custom build steps and testing.'
				) }
			/>

			<RadioControl
				selected={ formData.deploymentMode }
				onChange={ ( value ) => handleChange( { deploymentMode: value as 'simple' | 'advanced' } ) }
				options={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Advanced' ), value: 'advanced' },
				] }
				disabled={ ! selectedRepository }
			/>

			{ isAdvancedSelected && renderAdvancedWorkflow() }

			<HStack justify="flex-end">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleSubmit }
					isBusy={ mutation.isPending }
					disabled={ ! isFormValid || mutation.isPending }
					__next40pxDefaultSize
				>
					{ submitText }
				</Button>
			</HStack>
		</>
	);
};
