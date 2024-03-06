import { Button, FormLabel, Spinner } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Notice from 'calypso/components/notice';
import { useGithubRepositoryBranchesQuery } from 'calypso/my-sites/github-deployments/use-github-repository-branches-query';
import { useGithubRepositoryChecksQuery } from 'calypso/my-sites/github-deployments/use-github-repository-checks-query';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
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
	repository?: GitHubRepositoryData;
	deploymentId?: number;
	installationId?: number;
	initialValues?: InitialValues;
	changeRepository?(): void;
	onSubmit( deploymentData: CodeDeploymentData ): Promise< unknown >;
}

export const GitHubConnectionForm = ( {
	repository,
	deploymentId,
	installationId,
	initialValues = {
		branch: repository?.default_branch ?? 'main',
		destPath: '/',
		isAutomated: false,
		workflowPath: undefined,
	},
	changeRepository,
	onSubmit,
}: GitHubConnectionFormProps ) => {
	const [ branch, setBranch ] = useState( initialValues.branch );
	const [ destPath, setDestPath ] = useState( initialValues.destPath );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( initialValues.isAutomated );

	const [ workflowPath, setWorkflowPath ] = useState< string | undefined >(
		initialValues.workflowPath
	);
	const suggestionsApplied = useRef( false );
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

	if ( repoChecks && ! suggestionsApplied.current ) {
		setDestPath( repoChecks.suggested_directory );
		suggestionsApplied.current = true;
	}

	const submitDisabled = !! workflowPath && workflowCheckResult?.conclusion !== 'success';

	const useComposerWorkflow = repoChecks?.has_composer && ! repoChecks.has_vendor;

	return (
		<form
			className="github-deployments-connect-repository"
			onSubmit={ async ( e ) => {
				e.preventDefault();

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
			<div className="github-deployments-connect-repository__configs">
				{ deploymentId && (
					<div css={ { marginBottom: '16px' } }>
						<Notice isCompact>
							{ __(
								'Changes to an existing connection will be applied in the next deployment run.'
							) }
						</Notice>
					</div>
				) }
				<FormFieldset>
					<FormLabel>{ __( 'Repository' ) }</FormLabel>
					<div className="github-deployments-connect-repository__repository">
						{ repository ? (
							<ExternalLink
								href={ `https://github.com/${ repository.owner }/${ repository.name }` }
							>
								{ repository.owner }/{ repository.name }
							</ExternalLink>
						) : (
							<FormSettingExplanation css={ { margin: 0 } }>
								{ __( 'No repository selected' ) }
							</FormSettingExplanation>
						) }
						{ changeRepository && (
							<Button compact onClick={ changeRepository }>
								{ __( 'Change' ) }
							</Button>
						) }
					</div>
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
				<Button type="submit" primary busy={ isPending } disabled={ isPending || submitDisabled }>
					{ deploymentId ? __( 'Update connection' ) : __( 'Connect repository' ) }
				</Button>
			</div>
			<DeploymentStyle
				isDisabled={ isFetchingBranches }
				branchName={ branch }
				repository={ repository }
				workflowPath={ workflowPath }
				onChooseWorkflow={ ( filePath ) => setWorkflowPath( filePath ) }
				workflowCheckResult={ workflowCheckResult }
				isCheckingWorkflow={ isCheckingWorkflow }
				onWorkflowVerify={ checkWorkflow }
				useComposerWorkflow={ !! useComposerWorkflow }
			/>
		</form>
	);
};
