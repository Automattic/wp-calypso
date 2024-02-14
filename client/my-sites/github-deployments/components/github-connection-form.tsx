import { Button, FormLabel } from '@automattic/components';
import { ExternalLink, FormToggle, SelectControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { GitHubAccountData } from 'calypso/my-sites/github-deployments/use-github-accounts-query';
import { useGithubRepositoryBranchesQuery } from 'calypso/my-sites/github-deployments/use-github-repository-branches-query';
import { GitHubRepositoryData } from '../use-github-repositories-query';
import { DeploymentStyle } from './repositories/deployment-style';
import '../components/repositories/style.scss';

interface CodeDeploymentData {
	externalRepositoryId: number;
	branchName: string;
	targetDir: string;
	installationId: number;
	isAutomated: boolean;
}

interface InitialValues {
	branch: string;
	destPath: string;
	isAutomated: boolean;
}

interface ConnectRepositoryDialogProps {
	repository: GitHubRepositoryData;
	account: GitHubAccountData;
	ctaLabel: string;
	initialValues?: InitialValues;
	changeRepository?(): void;
	onSubmit( deploymentData: CodeDeploymentData ): Promise< unknown >;
}

export const GitHubConnectionForm = ( {
	repository,
	account,
	ctaLabel,
	initialValues = { branch: repository.default_branch, destPath: '/', isAutomated: false },
	changeRepository,
	onSubmit,
}: ConnectRepositoryDialogProps ) => {
	const [ branch, setBranch ] = useState( initialValues.branch );
	const [ destPath, setDestPath ] = useState( initialValues.destPath );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( initialValues.isAutomated );

	const { data: branches = [ branch ], isLoading: isFetchingBranches } =
		useGithubRepositoryBranchesQuery( account.external_id, repository.owner, repository.name );

	const branchList = branches.length > 0 ? branches : [ branch ];
	const branchOptions = branchList.map( ( branch ) => ( { value: branch, label: branch } ) );
	const [ isPending, setIsPending ] = useState( false );

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
						installationId: account.external_id,
						isAutomated: isAutoDeploy,
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
					<FormLabel>{ __( 'Deployment branch' ) }</FormLabel>
					<SelectControl value={ branch } options={ branchOptions } onChange={ setBranch } />
					{ isFetchingBranches && <Spinner /> }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'Destination directory' ) }</FormLabel>
					<FormTextInput
						value={ destPath }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setDestPath( event.currentTarget.value )
						}
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'Automatic deploys' ) }</FormLabel>
					<div className="github-deployments-connect-repository__automatic-deploys">
						<FormToggle
							checked={ isAutoDeploy }
							onChange={ () => setIsAutoDeploy( ! isAutoDeploy ) }
						/>
						<span>{ __( 'Deploy changes on push' ) }</span>
					</div>
				</FormFieldset>
				<Button type="submit" primary busy={ isPending } disabled={ isPending }>
					{ ctaLabel }
				</Button>
			</div>
			<div className="github-deployments-connect-repository__deployment-style">
				<FormFieldset>
					<DeploymentStyle />
				</FormFieldset>
			</div>
		</form>
	);
};
