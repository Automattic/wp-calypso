import { Button, Card, Spinner } from '@automattic/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SocialLogo from 'calypso/components/social-logo';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DisconnectGitHubExpander } from '../disconnect-github-expander';
import { RepoBranch, useGithubBranches } from './use-github-branches';
import { useGithubConnectMutation } from './use-github-connect';
import { Repo, useGithubRepos } from './use-github-repos';
import type { ComponentProps } from 'react';

interface GithubConnectCardProps {
	connection: ComponentProps< typeof DisconnectGitHubExpander >[ 'connection' ];
}
import './style.scss';

const noticeOptions = {
	duration: 3000,
};

export const GithubConnectCard = ( { connection }: GithubConnectCardProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const [ selectedRepo, setSelectedRepo ] = useState< Repo >();
	const [ selectedBranch, setSelectedBranch ] = useState< RepoBranch >();
	const [ basePath, setBasePath ] = useState< string >( '' );
	const { data: repos, isLoading: isLoadingRepos } = useGithubRepos( siteId, {
		onSuccess( repos ) {
			setSelectedRepo( repos[ 0 ] );
		},
	} );
	const { data: branches, isLoading: isLoadingBranches } = useGithubBranches(
		siteId,
		selectedRepo?.name,
		{
			onSuccess( branches ) {
				setSelectedBranch( branches[ 0 ] );
			},
		}
	);

	const { connectBranch, isLoading: isConnecting } = useGithubConnectMutation( siteId, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Branch connected successfully' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed to connect: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );

	const showSpinner = ! repos && ! branches && ( isLoadingRepos || isLoadingBranches );
	const disabled = isLoadingBranches || isConnecting;
	const handleRepoSelect = ( repoName: string ) => {
		const selectedRepo = repos?.find( ( repo ) => repo.full_name === repoName );
		setSelectedRepo( selectedRepo );
	};

	const handleBranchSelect = ( branchName: string ) => {
		const selectedBranch = branches?.find( ( branch ) => branch.name === branchName );
		setSelectedBranch( selectedBranch );
	};

	const handleBasePathChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setBasePath( event.currentTarget.value );
	};

	return (
		<Card className="connect-branch-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ __( 'Connect Branch' ) }</CardHeading>
			<div>
				<p>{ __( 'Changes pushed to connected branch will be deployed automatically' ) }</p>
				{ showSpinner ? (
					<Spinner />
				) : (
					<FormFieldset className="connect-branch__fields">
						<FormSelect
							className="connect-branch__field"
							onChange={ ( event ) => handleRepoSelect( event.currentTarget.value ) }
							value={ selectedRepo?.full_name }
						>
							{ repos?.map( ( repo ) => (
								<option value={ repo.full_name } key={ repo.name }>
									{ repo.full_name }
								</option>
							) ) }
						</FormSelect>
						<FormSelect
							className="connect-branch__field"
							onChange={ ( event ) => handleBranchSelect( event.currentTarget.value ) }
							value={ selectedBranch?.name }
						>
							{ branches?.map( ( branch ) => (
								<option value={ branch.name } key={ branch.name }>
									{ branch.name }
								</option>
							) ) }
						</FormSelect>
						<Button
							primary
							busy={ disabled }
							onClick={ () => {
								connectBranch( {
									repoName: selectedRepo?.name,
									branchName: selectedBranch?.name,
									basePath: basePath?.trim(),
								} );
							} }
							className="connect-branch__field"
							disabled={ disabled }
						>
							<span>{ __( 'Connect' ) }</span>
						</Button>
					</FormFieldset>
				) }
				<div>
					<span>
						<strong>{ __( 'Root Directory' ) }</strong>
						<small>
							{ __(
								'(you can specify a root directory and only changes in that directory will be deployed)'
							) }
						</small>
					</span>
					<FormTextInput
						id="root_path"
						placeholder="/wp-content"
						value={ basePath }
						dir="ltr"
						onChange={ handleBasePathChange }
					/>
				</div>
			</div>
			<div style={ { marginTop: '16px' } }>
				<DisconnectGitHubExpander connection={ connection } />
			</div>
		</Card>
	);
};
