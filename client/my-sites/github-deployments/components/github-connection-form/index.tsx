import { Button, FormLabel, Spinner } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { GitHubInstallationData } from 'calypso/my-sites/github-deployments/use-github-installations-query';
import { useGithubRepositoryBranchesQuery } from 'calypso/my-sites/github-deployments/use-github-repository-branches-query';
import { useGithubRepositoryChecksQuery } from 'calypso/my-sites/github-deployments/use-github-repository-checks-query';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { AutomatedDeploymentsToggle } from '../automated-deployments-toggle';
import { DeploymentStyle } from '../deployment-style';
import { useCheckWorkflowQuery } from '../deployment-style/use-check-workflow-query';

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
	repository: GitHubRepositoryData;
	installation: GitHubInstallationData;
	ctaLabel: string;
	initialValues?: InitialValues;
	changeRepository?(): void;
	onSubmit( deploymentData: CodeDeploymentData ): Promise< unknown >;
}

export const GitHubConnectionForm = ( {
	repository,
	installation,
	ctaLabel,
	initialValues = {
		branch: repository.default_branch,
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
	const { __ } = useI18n();

	const { data: branches, isLoading: isFetchingBranches } = useGithubRepositoryBranchesQuery(
		installation.external_id,
		repository.owner,
		repository.name
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
			enabled: !! workflowPath,
			refetchOnWindowFocus: false,
		}
	);

	//TODO use the response here to pre-populated fields, show warnings, and make suggestions
	useGithubRepositoryChecksQuery(
		installation.external_id,
		repository.owner,
		repository.name,
		branch
	);

	const submitDisabled = !! workflowPath && workflowCheckResult?.conclusion !== 'success';

	return (
		<form
			className="github-deployments-connect-repository"
			onSubmit={ async ( e ) => {
				e.preventDefault();

				setIsPending( true );

				try {
					await onSubmit( {
						externalRepositoryId: repository.id,
						branchName: branch,
						targetDir: destPath,
						installationId: installation.external_id,
						isAutomated: isAutoDeploy,
						workflowPath: workflowPath ?? undefined,
					} );
				} finally {
					setIsPending( false );
				}
			} }
		>
			<div className="github-deployments-connect-repository__configs">
				<FormFieldset>
					<FormLabel>{ __( 'Repository' ) }</FormLabel>
					<div className="github-deployments-connect-repository__repository">
						<ExternalLink href={ `https://github.com/${ repository.owner }/${ repository.name }` }>
							{ repository.owner }/{ repository.name }
						</ExternalLink>
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
				<FormFieldset>
					<FormLabel htmlFor="target">{ __( 'Destination directory' ) }</FormLabel>
					<FormTextInput
						id="target"
						value={ destPath }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
							let targetDir = event.currentTarget.value.trim();
							targetDir = targetDir.startsWith( '/' ) ? targetDir : `/${ targetDir }`;

							setDestPath( targetDir );
						} }
					/>
					<FormSettingExplanation>
						{ __( 'This path is relative to the server root' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<AutomatedDeploymentsToggle
					onChange={ setIsAutoDeploy }
					value={ isAutoDeploy }
					hasWorkflowPath={ !! workflowPath }
				/>
				<Button type="submit" primary busy={ isPending } disabled={ isPending || submitDisabled }>
					{ ctaLabel }
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
			/>
		</form>
	);
};
