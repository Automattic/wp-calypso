import { Button, FormInputValidation, FormLabel, Spinner } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { HostingCardHeading, HostingCardDescription } from 'calypso/components/hosting-card';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { useGithubRepositoryBranchesQuery } from '../../use-github-repository-branches-query';
import { useGithubRepositoryChecksQuery } from '../../use-github-repository-checks-query';
import { AutomatedDeploymentsToggle } from '../automated-deployments-toggle';
import { DeploymentStyle } from '../deployment-style';
import { useCheckWorkflowQuery } from '../deployment-style/use-check-workflow-query';
import { TargetDirInput } from '../target-dir-input';

import './style.scss';

interface CodeDeploymentData {
	externalRepositoryId: number;
	branchName: string;
	targetDir: string;
	installationId: number;
	isAutomated: boolean;
	workflowPath?: string;
}

interface InitialValues {
	branch: string;
	destPath: string;
	isAutomated: boolean;
	workflowPath?: string;
}

interface GitHubConnectionFormProps {
	repository?: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' > & { default_branch?: string };
	deploymentId?: number;
	installationId?: number;
	initialValues: InitialValues;
	changeRepository?(): void;
	onSubmit( deploymentData: CodeDeploymentData ): Promise< unknown >;
}

export const GitHubConnectionForm = ( {
	repository,
	deploymentId,
	installationId,
	initialValues,
	changeRepository,
	onSubmit,
}: GitHubConnectionFormProps ) => {
	const [ submitted, setSubmitted ] = useState( false );

	const [ branch, setBranch ] = useState( initialValues.branch );
	const [ destPath, setDestPath ] = useState( initialValues.destPath );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( initialValues.isAutomated );
	const [ workflowPath, setWorkflowPath ] = useState< string | undefined >(
		initialValues.workflowPath
	);

	const { __ } = useI18n();

	const { data: branches, isLoading: isFetchingBranches } = useGithubRepositoryBranchesQuery(
		installationId,
		repository?.owner,
		repository?.name
	);

	const branchOptions = useMemo( () => {
		if ( ! branches?.length ) {
			return [ branch ];
		}

		return [ branch, ...branches.filter( ( remoteBranch ) => remoteBranch !== branch ) ];
	}, [ branches, branch ] );
	const [ isPending, setIsPending ] = useState( false );

	const {
		data: workflowCheckResult,
		isFetching: isCheckingWorkflow,
		refetch: checkWorkflow,
	} = useCheckWorkflowQuery(
		{
			repository,
			branchName: branch,
			workflowFilename: workflowPath,
		},
		{
			enabled: !! repository && !! workflowPath,
			refetchOnWindowFocus: false,
		}
	);

	const { data: repoChecks } = useGithubRepositoryChecksQuery(
		installationId,
		repository?.owner,
		repository?.name,
		branch
	);

	useEffect( () => {
		// Only apply path suggestions if creating a new deployment
		if ( ! deploymentId && repoChecks?.suggested_directory ) {
			setDestPath( repoChecks.suggested_directory );
		}
	}, [ deploymentId, repoChecks ] );

	const displayMissingRepositoryError = submitted && ! repository;
	const submitDisabled = !! workflowPath && workflowCheckResult?.conclusion !== 'success';

	const useComposerWorkflow = repoChecks?.has_composer && ! repoChecks.has_vendor;

	return (
		<form
			className="github-deployments-connect-repository"
			onSubmit={ async ( e ) => {
				e.preventDefault();

				setSubmitted( true );

				if ( ! repository || ! installationId ) {
					return;
				}

				setIsPending( true );

				try {
					await onSubmit( {
						externalRepositoryId: repository.id,
						branchName: branch,
						targetDir: destPath,
						installationId: installationId,
						isAutomated: isAutoDeploy,
						workflowPath: workflowPath ?? undefined,
					} );
				} finally {
					setIsPending( false );
				}
			} }
		>
			<div className="github-deployments-connect-repository__content">
				<div className="github-deployments-connect-repository__configs">
					<HostingCardHeading
						title={ deploymentId ? __( 'Manage a repository' ) : __( 'Connect a repository' ) }
					/>
					<HostingCardDescription>
						{ __(
							'Configure a repository connection to deploy a GitHub repository to your WordPress.com site.'
						) }
					</HostingCardDescription>
					<FormFieldset className="github-deployments-connect-repository__repository">
						<FormLabel>{ __( 'Repository' ) }</FormLabel>
						<div
							className={ clsx( 'github-deployments-connect-repository__repository-input', {
								'github-deployments-connect-repository__repository-input--has-error':
									displayMissingRepositoryError,
							} ) }
						>
							{ repository ? (
								<ExternalLink
									href={ `https://github.com/${ repository.owner }/${ repository.name }` }
								>
									{ repository.owner }/{ repository.name }
								</ExternalLink>
							) : (
								<FormSettingExplanation css={ { margin: '0 !important' } }>
									{ __( 'No repository selected' ) }
								</FormSettingExplanation>
							) }
							{ changeRepository && (
								<Button compact onClick={ changeRepository }>
									{ __( 'Select repository' ) }
								</Button>
							) }
						</div>
						{ displayMissingRepositoryError && (
							<FormInputValidation isError text={ __( 'Please select a repository' ) } />
						) }
					</FormFieldset>
					<FormFieldset>
						<FormLabel htmlFor="branch">{ __( 'Deployment branch' ) }</FormLabel>
						<div className="github-deployments-connect-repository__branch-select">
							<FormSelect
								id="branch"
								disabled={ isFetchingBranches }
								onChange={ ( event: ChangeEvent< HTMLSelectElement > ) =>
									setBranch( event.target.value )
								}
								value={ branch }
							>
								{ branchOptions.map( ( branchOption ) => (
									<option key={ branchOption } value={ branchOption }>
										{ branchOption }
									</option>
								) ) }
							</FormSelect>
							{ isFetchingBranches && <Spinner /> }
						</div>
					</FormFieldset>
					<TargetDirInput onChange={ setDestPath } value={ destPath } />
					<AutomatedDeploymentsToggle
						onChange={ setIsAutoDeploy }
						value={ isAutoDeploy }
						hasWorkflowPath={ !! workflowPath }
					/>
				</div>
				<DeploymentStyle
					isDisabled={ ! repository || isFetchingBranches }
					branchName={ branch }
					repository={ repository }
					workflowPath={ workflowPath }
					onChooseWorkflow={ ( filePath ) => setWorkflowPath( filePath ) }
					workflowCheckResult={ workflowCheckResult }
					isCheckingWorkflow={ isCheckingWorkflow }
					onWorkflowVerify={ checkWorkflow }
					useComposerWorkflow={ !! useComposerWorkflow }
				/>
			</div>
			<div className="github-deployments-connect-repository__submit">
				<Button type="submit" primary busy={ isPending } disabled={ isPending || submitDisabled }>
					{ deploymentId ? __( 'Update' ) : __( 'Connect' ) }
				</Button>

				{ deploymentId && (
					<FormSettingExplanation>
						{ __( 'Changes will be applied in the next deployment run.' ) }
					</FormSettingExplanation>
				) }
			</div>
		</form>
	);
};
