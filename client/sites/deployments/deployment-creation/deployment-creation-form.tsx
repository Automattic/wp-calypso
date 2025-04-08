import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useReducer } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../state';
import { GitHubConnectionForm } from '../components/github-connection-form';
import { GitHubInstallationData } from '../use-github-installations-query';
import { GitHubRepositoryData } from '../use-github-repositories-query';
import { RepositorySelectionDialog } from './repository-selection-dialog';
import { useCreateCodeDeployment } from './use-create-code-deployment';

const noticeOptions = {
	duration: 3000,
};

interface GitHubDeploymentCreationFormProps {
	onConnected(): void;
}

interface ConnectionFormReducerData {
	isRepositoryPickerOpen: boolean;
	installation?: GitHubInstallationData;
	repository?: GitHubRepositoryData;
}

const INITIAL_VALUES: ConnectionFormReducerData = {
	isRepositoryPickerOpen: false,
	installation: undefined,
	repository: undefined,
};

type ConnectionFormReducerActions =
	| { type: 'open-repository-picker' }
	| {
			type: 'select-repository';
			installation: GitHubInstallationData;
			repository: GitHubRepositoryData;
	  }
	| { type: 'close-repository-picker' };

const connectionFormReducer = ( data = INITIAL_VALUES, action: ConnectionFormReducerActions ) => {
	if ( action.type === 'open-repository-picker' ) {
		return {
			...data,
			isRepositoryPickerOpen: true,
		};
	}

	if ( action.type === 'select-repository' ) {
		return {
			isRepositoryPickerOpen: false,
			installation: action.installation,
			repository: action.repository,
		};
	}

	if ( action.type === 'close-repository-picker' ) {
		return {
			...data,
			isRepositoryPickerOpen: false,
		};
	}

	return data;
};

export const GitHubDeploymentCreationForm = ( {
	onConnected,
}: GitHubDeploymentCreationFormProps ) => {
	const [ { isRepositoryPickerOpen, installation, repository }, dispatch ] = useReducer(
		connectionFormReducer,
		INITIAL_VALUES
	);

	const initialValues = useMemo( () => {
		return {
			branch: repository?.default_branch ?? 'main',
			destPath: '/',
			isAutomated: false,
			workflowPath: undefined,
		};
	}, [ repository ] );

	const siteId = useSelector( getSelectedSiteId );
	const reduxDispatch = useDispatch();
	const { createDeployment } = useCreateCodeDeployment( siteId, {
		onSuccess: ( data ) => {
			reduxDispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
			reduxDispatch(
				recordTracksEvent( 'calypso_hosting_github_create_deployment_success', {
					deployment_type: data ? getDeploymentTypeFromPath( data.target_dir ) : null,
					is_automated: data?.is_automated,
					workflow_path: data?.workflow_path,
				} )
			);
			onConnected();
		},
		onError: ( error ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_hosting_github_create_deployment_failure', {
					reason: error.code,
				} )
			);
			reduxDispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed to create deployment: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );

	return (
		<>
			<GitHubConnectionForm
				installationId={ installation?.external_id }
				key={ repository?.id ?? 'none' }
				repository={ repository }
				initialValues={ initialValues }
				changeRepository={ () => {
					reduxDispatch( recordTracksEvent( 'calypso_hosting_github_repository_picker_click' ) );
					dispatch( { type: 'open-repository-picker' } );
				} }
				onSubmit={ ( {
					externalRepositoryId,
					branchName,
					targetDir,
					installationId,
					isAutomated,
					workflowPath,
				} ) =>
					createDeployment( {
						externalRepositoryId,
						branchName,
						targetDir,
						installationId,
						isAutomated,
						workflowPath,
					} )
				}
			/>
			<RepositorySelectionDialog
				isVisible={ isRepositoryPickerOpen }
				onChange={ ( installation, repository ) => {
					reduxDispatch( recordTracksEvent( 'calypso_hosting_github_select_repository_click' ) );
					dispatch( { type: 'select-repository', installation, repository } );
				} }
				onClose={ () => dispatch( { type: 'close-repository-picker' } ) }
			/>
		</>
	);
};

export function getDeploymentTypeFromPath( path: string ) {
	if ( path === '/' ) {
		return 'root';
	} else if ( path === '/wp-content' ) {
		return 'wp-content';
	} else if ( path.includes( 'wp-content/plugins' ) ) {
		return 'plugin';
	}
	return 'theme';
}
