import {
	githubInstallationsQuery,
	githubRepositoriesQuery,
	githubRepositoryBranchesQuery,
	githubRepositoryChecksQuery,
	githubWorkflowChecksQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	SelectControl,
	ToggleControl,
	ComboboxControl,
	TextControl,
	RadioControl,
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCreateCodeDeployment } from './use-create-code-deployment';
import { useWorkflowValidations } from './use-workflow-validations';
import { WorkflowValidationList } from './workflow-validation-list';
import type {
	Site,
	GitHubInstallation,
	GitHubRepository,
	GitHubWorkflowValidation,
} from '@automattic/api-core';

interface ConnectRepositoryFormProps {
	site: Site;
	onConnected: () => void;
	onCancel: () => void;
}

const INSTALL_APP_URL = 'https://github.com/apps/wordpress-com/installations/new';

export const ConnectRepositoryForm = ( {
	site,
	onConnected,
	onCancel,
}: ConnectRepositoryFormProps ) => {
	const [ selectedInstallationId, setSelectedInstallationId ] = useState< number | '' >( '' );
	const [ selectedRepositoryId, setSelectedRepositoryId ] = useState< number | '' >( '' );
	const [ branch, setBranch ] = useState( '' );
	const [ targetDir, setTargetDir ] = useState( '/' );
	const [ isAutomated, setIsAutomated ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ isTargetDirDirty, setIsTargetDirDirty ] = useState( false );
	const [ deploymentMode, setDeploymentMode ] = useState< 'simple' | 'advanced' >( 'simple' );
	const [ workflowPath, setWorkflowPath ] = useState< string | undefined >( undefined );

	const {
		data: installations = [],
		isLoading: isLoadingInstallations,
		error: installationsError,
		refetch: refetchInstallations,
	} = useQuery( githubInstallationsQuery() );

	useEffect( () => {
		if ( installations.length === 0 ) {
			setSelectedInstallationId( '' );
			return;
		}

		if ( selectedInstallationId === '' ) {
			setSelectedInstallationId( installations[ 0 ].external_id );
			return;
		}

		const stillExists = installations.some(
			( installation ) => installation.external_id === selectedInstallationId
		);

		if ( ! stillExists ) {
			setSelectedInstallationId( installations[ 0 ].external_id );
		}
	}, [ installations, selectedInstallationId ] );

	const selectedInstallation: GitHubInstallation | undefined = useMemo( () => {
		if ( selectedInstallationId === '' ) {
			return undefined;
		}

		return installations.find(
			( installation ) => installation.external_id === selectedInstallationId
		);
	}, [ installations, selectedInstallationId ] );

	const { data: repositories = [], isLoading: isLoadingRepositories } = useQuery( {
		...githubRepositoriesQuery( selectedInstallation?.external_id ?? 0 ),
		enabled: !! selectedInstallation,
	} );

	useEffect( () => {
		setSelectedRepositoryId( '' );
		setBranch( '' );
		setTargetDir( '/' );
		setIsTargetDirDirty( false );
		setWorkflowPath( deploymentMode === 'advanced' ? 'wpcom.yml' : undefined );
	}, [ selectedInstallationId, deploymentMode ] );

	useEffect( () => {
		if ( selectedRepositoryId === '' ) {
			setIsTargetDirDirty( false );
			setTargetDir( '/' );
			setWorkflowPath( deploymentMode === 'advanced' ? 'wpcom.yml' : undefined );
			return;
		}

		const stillExists = repositories.some(
			( repository ) => repository.id === selectedRepositoryId
		);

		if ( ! stillExists ) {
			setSelectedRepositoryId( '' );
			setIsTargetDirDirty( false );
			setTargetDir( '/' );
			setWorkflowPath( deploymentMode === 'advanced' ? 'wpcom.yml' : undefined );
		}
	}, [ repositories, selectedRepositoryId, deploymentMode ] );

	const selectedRepository: GitHubRepository | undefined = useMemo( () => {
		if ( selectedRepositoryId === '' ) {
			return undefined;
		}

		return repositories.find( ( repository ) => repository.id === selectedRepositoryId );
	}, [ repositories, selectedRepositoryId ] );

	useEffect( () => {
		if ( deploymentMode === 'advanced' ) {
			setWorkflowPath( ( current ) => current ?? 'wpcom.yml' );
		} else {
			setWorkflowPath( undefined );
		}
	}, [ deploymentMode ] );

	useEffect( () => {
		if ( selectedRepository?.default_branch ) {
			setBranch( selectedRepository.default_branch );
			return;
		}

		if ( ! selectedRepository ) {
			setBranch( '' );
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
			branch
		),
		enabled: !! selectedInstallation && !! selectedRepository && !! branch,
	} );

	const workflowValidations = useWorkflowValidations( branch );

	const {
		data: workflowChecks,
		isFetching: isFetchingWorkflowChecks,
		refetch: refetchWorkflowChecks,
	} = useQuery(
		githubWorkflowChecksQuery(
			selectedInstallation?.external_id ?? 0,
			selectedRepository?.owner ?? '',
			selectedRepository?.name ?? '',
			branch,
			workflowPath ?? ''
		)
	);

	const isAdvancedSelected = deploymentMode === 'advanced';
	const canVerifyWorkflow = Boolean(
		isAdvancedSelected && workflowPath && selectedInstallation && selectedRepository && branch
	);

	useEffect( () => {
		if ( ! repositoryChecks?.suggested_directory ) {
			return;
		}

		if ( isTargetDirDirty ) {
			return;
		}

		setTargetDir( repositoryChecks.suggested_directory );
	}, [ repositoryChecks?.suggested_directory, isTargetDirDirty ] );

	const branchOptions = useMemo( () => {
		const names = new Set< string >();
		if ( selectedRepository?.default_branch ) {
			names.add( selectedRepository.default_branch );
		}
		remoteBranches.forEach( ( branchName ) => names.add( branchName ) );
		if ( branch ) {
			names.add( branch );
		}
		return Array.from( names ).map( ( name ) => ( {
			label: name,
			value: name,
		} ) );
	}, [ remoteBranches, selectedRepository?.default_branch, branch ] );

	const branchSelectOptions = branchOptions.length
		? branchOptions
		: [ { label: __( 'Select a branch' ), value: '' } ];

	const { createDeployment } = useCreateCodeDeployment( site.ID, {
		onSuccess: () => {
			onConnected();
		},
		onError: () => {
			setIsSubmitting( false );
		},
	} );

	const handleAddGithubAccount = useCallback( () => {
		const popup = window.open( INSTALL_APP_URL, '_blank', 'noopener' );

		if ( ! popup ) {
			return;
		}

		const handleFocus = () => {
			refetchInstallations();
			window.removeEventListener( 'focus', handleFocus );
		};

		window.addEventListener( 'focus', handleFocus );
	}, [ refetchInstallations ] );

	const handleSubmit = async () => {
		if ( ! selectedRepository || ! selectedInstallation || ! branch || ! targetDir ) {
			return;
		}

		setIsSubmitting( true );

		try {
			await createDeployment( {
				externalRepositoryId: selectedRepository.id,
				branchName: branch,
				targetDir,
				installationId: selectedInstallation.external_id,
				isAutomated,
				workflowPath: isAdvancedSelected ? workflowPath : undefined,
			} );
		} catch ( error ) {
			setIsSubmitting( false );
		}
	};

	const installationOptions = useMemo( () => {
		return [
			{ label: __( 'Select an account' ), value: '' },
			...installations.map( ( installation ) => ( {
				label: installation.account_name,
				value: installation.external_id.toString(),
			} ) ),
		];
	}, [ installations ] );

	const repositoryOptions = useMemo( () => {
		return repositories.map( ( repo ) => ( {
			label: `${ repo.owner }/${ repo.name }`,
			value: repo.id.toString(),
		} ) );
	}, [ repositories ] );

	const installationHelpText = useMemo( () => {
		if ( isLoadingInstallations ) {
			return __( 'Loading GitHub accounts…' );
		}

		if ( installationsError ) {
			return __( 'We could not load your GitHub accounts. Try again after installing the app.' );
		}

		if ( installations.length === 0 ) {
			return __( 'Add a GitHub account to select a repository.' );
		}

		return undefined;
	}, [ installations, installationsError, isLoadingInstallations ] );

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

	const isAdvancedValid = ! isAdvancedSelected || !! workflowPath;
	const isFormValid = !! (
		selectedRepository &&
		selectedInstallation &&
		branch &&
		targetDir &&
		isAdvancedValid
	);

	const handleVerifyWorkflow = () => {
		if ( ! canVerifyWorkflow ) {
			return;
		}

		void refetchWorkflowChecks();
	};

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 1 }>
				<Text weight={ 600 }>{ __( 'Configure repository connection' ) }</Text>
				<Text variant="muted">
					{ __( 'Select a repository and choose where you’d like your files to deploy.' ) }
				</Text>
			</VStack>

			<VStack spacing={ 2 }>
				<HStack justify="space-between" alignment="center">
					<Text weight={ 500 } size="11" style={ { textTransform: 'uppercase' } }>
						{ __( 'GitHub account' ) }
					</Text>
					<Button variant="link" onClick={ handleAddGithubAccount }>
						{ __( 'Add GitHub account' ) }
					</Button>
				</HStack>
				<SelectControl
					__next40pxDefaultSize
					aria-label={ __( 'GitHub account' ) }
					value={ selectedInstallationId === '' ? '' : selectedInstallationId.toString() }
					onChange={ ( value ) => {
						if ( ! value ) {
							setSelectedInstallationId( '' );
							return;
						}

						const numericValue = Number( value );
						setSelectedInstallationId( Number.isNaN( numericValue ) ? '' : numericValue );
					} }
					options={ installationOptions }
					disabled={ isLoadingInstallations }
					help={ installationHelpText }
				/>
			</VStack>

			<VStack spacing={ 2 }>
				<Text weight={ 500 } size="11" style={ { textTransform: 'uppercase' } }>
					{ __( 'Repository' ) }
				</Text>
				<ComboboxControl
					__next40pxDefaultSize
					allowReset
					aria-label={ __( 'Repository' ) }
					value={ selectedRepositoryId === '' ? '' : selectedRepositoryId.toString() }
					onChange={ ( value ) => {
						if ( ! value ) {
							setSelectedRepositoryId( '' );
							return;
						}

						const numericValue = Number( value );
						setSelectedRepositoryId( Number.isNaN( numericValue ) ? '' : numericValue );
					} }
					options={ repositoryOptions }
					placeholder={ __( 'Select a repository' ) }
					help={ repositoryHelpText }
				/>
			</VStack>

			<SelectControl
				label={ __( 'Deployment Branch' ) }
				value={ branch }
				options={ branchSelectOptions }
				onChange={ ( value ) => setBranch( value ? String( value ) : '' ) }
				disabled={ ! selectedRepository || isLoadingBranches }
				help={
					isLoadingBranches
						? __( 'Loading branches…' )
						: __( 'Select the branch to deploy from this repository.' )
				}
				__next40pxDefaultSize
			/>

			<TextControl
				label={ __( 'Destination Directory' ) }
				value={ targetDir }
				onChange={ ( value ) => {
					const trimmedValue = value.trim();
					let normalisedValue = '/';
					if ( trimmedValue ) {
						if ( trimmedValue.startsWith( '/' ) ) {
							normalisedValue = trimmedValue;
						} else {
							normalisedValue = `/${ trimmedValue }`;
						}
					}
					setTargetDir( normalisedValue );
					setIsTargetDirDirty( true );
				} }
				placeholder={ __( 'Paste a path to the destination directory' ) }
				help={ __( 'This path is relative to the server root.' ) }
				__next40pxDefaultSize
			/>

			<ToggleControl
				label={ __( 'Automated Deployments' ) }
				checked={ isAutomated }
				onChange={ setIsAutomated }
			/>

			<VStack spacing={ 2 }>
				<Text weight={ 600 }>{ __( 'Pick your deployment mode' ) }</Text>
				<Text variant="muted">
					{ __(
						'Simple deployments copy repository files to a directory, while advanced deployments use scripts for custom build steps and testing.'
					) }
				</Text>
				<RadioControl
					selected={ deploymentMode }
					onChange={ ( value ) => setDeploymentMode( value as 'simple' | 'advanced' ) }
					options={ [
						{ label: __( 'Simple' ), value: 'simple' },
						{ label: __( 'Advanced' ), value: 'advanced' },
					] }
					disabled={ ! selectedRepository }
				/>
			</VStack>

			{ isAdvancedSelected && (
				<VStack spacing={ 3 }>
					<TextControl
						label={ __( 'Deployment workflow' ) }
						value={ workflowPath ?? '' }
						onChange={ ( value ) => {
							const trimmedValue = value.trim();
							setWorkflowPath( trimmedValue ? trimmedValue : undefined );
						} }
						disabled={ ! selectedRepository }
						placeholder="wpcom.yml"
						help={ createInterpolateElement(
							__(
								'You can start with our basic workflow file and extend it. Looking for inspiration? Check out our <a>workflow recipes</a>.'
							),
							{
								a: (
									<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/" />
								),
							}
						) }
						__next40pxDefaultSize
					/>
					<WorkflowValidationList
						validations={ workflowValidations }
						result={ workflowChecks as GitHubWorkflowValidation | undefined }
						isLoading={ isFetchingWorkflowChecks }
						onVerify={ handleVerifyWorkflow }
						canVerify={ canVerifyWorkflow }
						repository={ selectedRepository }
						branchName={ branch }
						workflowPath={ workflowPath }
					/>
				</VStack>
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
