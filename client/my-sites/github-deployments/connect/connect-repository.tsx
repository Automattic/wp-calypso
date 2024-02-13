import { Button, FormLabel } from '@automattic/components';
import { QueryClient } from '@tanstack/react-query';
import { ExternalLink, FormToggle, SelectControl, Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset/index';
import FormTextInput from 'calypso/components/forms/form-text-input/index';
import { useCreateCodeDeployment } from 'calypso/my-sites/github-deployments/connect/use-create-code-deployment';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { CODE_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/use-code-deployments-query';
import { GitHubAccountData } from 'calypso/my-sites/github-deployments/use-github-accounts-query';
import { useGithubRepositoryBranchesQuery } from 'calypso/my-sites/github-deployments/use-github-repository-branches-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useDispatch, useSelector } from 'calypso/state/index';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubRepositoryData } from '../use-github-repositories-query';

import './repositories/style.scss';

interface ConnectRepositoryDialogProps {
	repository: GitHubRepositoryData;
	account: GitHubAccountData;
	goBack(): void;
	onConnected(): void;
}

const noticeOptions = {
	duration: 3000,
};

export const GitHubConnectRepository = ( {
	repository,
	account,
	goBack,
	onConnected,
}: ConnectRepositoryDialogProps ) => {
	const queryClient = new QueryClient();
	const dispatch = useDispatch();
	const [ branch, setBranch ] = useState( repository.default_branch );
	const [ destPath, setDestPath ] = useState( '/' );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( false );
	const siteId = useSelector( getSelectedSiteId );

	const { data: branches = [], isLoading: isFetchingBranches } = useGithubRepositoryBranchesQuery(
		repository.full_name
	);

	const branchOptions = branches.map( ( branch ) => ( { value: branch, label: branch } ) );

	const { createDeployment, isPending } = useCreateCodeDeployment( siteId, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
			onConnected();
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed create deployment: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
		onSettled: ( _, error ) => {
			queryClient.invalidateQueries( {
				queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
			} );
			dispatch(
				recordTracksEvent( 'calypso_hosting_github_create_deployment_success', {
					connected: ! error,
				} )
			);
		},
	} );

	function handleConnect() {
		createDeployment( {
			externalRepositoryId: repository.id,
			branchName: branch,
			targetDir: destPath,
			installationId: account.external_id,
			isAutomated: isAutoDeploy,
		} );
	}
	return (
		<form className="github-deployments-connect-repository">
			<FormFieldset>
				<FormLabel>{ __( 'Repository' ) }</FormLabel>
				<div className="github-deployments-connect-repository__repository">
					<ExternalLink href={ `https://github.com/${ repository.full_name }` }>
						{ repository.full_name }
					</ExternalLink>
					<Button compact onClick={ goBack }>
						{ __( 'Change' ) }
					</Button>
				</div>
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'Deployment branch' ) }</FormLabel>
				{ isFetchingBranches ? (
					<Spinner />
				) : (
					<SelectControl value={ branch } options={ branchOptions } onChange={ setBranch } />
				) }
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
			<Button primary busy={ isPending } disabled={ isPending } onClick={ handleConnect }>
				{ __( 'Connect repository' ) }
			</Button>
		</form>
	);
};
