import { Button, FormLabel } from '@automattic/components';
import { ExternalLink, FormToggle, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset/index';
import FormTextInput from 'calypso/components/forms/form-text-input/index';
import { useCreateCodeDeployment } from 'calypso/my-sites/github-deployments/connected/repositories/use-create-code-deployment';
import { GitHubAccountData } from 'calypso/my-sites/github-deployments/use-github-accounts-query';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import './style.scss';

interface ConnectRepositoryDialogProps {
	repository: GitHubRepositoryData;
	account: GitHubAccountData;
	goBack(): void;
}

const noticeOptions = {
	duration: 3000,
};

export const GitHubConnectRepository = ( {
	repository,
	account,
	goBack,
}: ConnectRepositoryDialogProps ) => {
	const dispatch = useDispatch();
	const [ branch, setBranch ] = useState( repository.default_branch );
	const [ destPath, setDestPath ] = useState( '/' );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( false );
	const selectedSiteId = useSelector( getSelectedSiteId );

	const { createDeployment, isPending } = useCreateCodeDeployment( selectedSiteId, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
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
				<SelectControl
					value={ branch }
					options={ [ { value: repository.default_branch, label: repository.default_branch } ] }
					onChange={ setBranch }
				/>
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
