import { Button, Card } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { ComponentProps, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import SocialLogo from 'calypso/components/social-logo';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DisconnectGitHubExpander } from '../disconnect-github-expander';
import { SearchRepos } from './search-repos';
import { useGithubBranches } from './use-github-branches';
import { useGithubConnectMutation } from './use-github-connect';

import './style.scss';
interface GithubConnectCardProps {
	connection: ComponentProps< typeof DisconnectGitHubExpander >[ 'connection' ];
}
const noticeOptions = {
	duration: 3000,
};

export const GithubConnectCard = ( { connection }: GithubConnectCardProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const [ selectedRepo, setSelectedRepo ] = useState< string >();
	const [ selectedBranch, setSelectedBranch ] = useState< string >();

	const { data: branches, isLoading: isLoadingBranches } = useGithubBranches(
		siteId,
		selectedRepo,
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

	const busy = isLoadingBranches || isConnecting;
	const disabled = ! selectedBranch || ! selectedRepo;
	const handleRepoSelect = ( repoName: string ) => {
		setSelectedRepo( repoName );
		setSelectedBranch( '' );
	};

	const handleBranchSelect = ( branchName: string ) => {
		setSelectedBranch( branchName );
	};

	const resetRepoSelection = () => {
		setSelectedRepo( '' );
		setSelectedBranch( '' );
	};

	return (
		<Card className="connect-branch-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ __( 'Deploy from GitHub' ) }</CardHeading>
			<div>
				<p>
					{ __( 'Changes pushed to the selected branch will be automatically deployed. ' ) }
					<ExternalLink href="#" target="_blank" rel="noopener noreferrer">
						{ __( 'Learn more' ) }
					</ExternalLink>
				</p>

				<FormFieldset className="connect-branch__fields">
					<FormFieldset className="connect-branch__field">
						<FormLabel htmlFor="repository">{ __( 'Repository' ) }</FormLabel>
						<SearchRepos
							siteId={ siteId }
							onSelect={ handleRepoSelect }
							onReset={ resetRepoSelection }
						/>
					</FormFieldset>
					<FormFieldset className="connect-branch__field">
						<FormLabel htmlFor="branch">{ __( 'Branch to deploy' ) }</FormLabel>
						<FormSelect
							className="connect-branch__field"
							onChange={ ( event ) => handleBranchSelect( event.currentTarget.value ) }
							value={ selectedBranch }
						>
							{ branches?.map( ( branch ) => (
								<option value={ branch } key={ branch }>
									{ branch }
								</option>
							) ) }
						</FormSelect>
					</FormFieldset>
				</FormFieldset>
			</div>
			<div className="connect-branch__buttons">
				<Button
					primary
					busy={ busy }
					onClick={ () => {
						connectBranch( {
							repoName: selectedRepo,
							branchName: selectedBranch,
						} );
					} }
					disabled={ disabled }
				>
					<span>{ __( 'Connect to repository' ) }</span>
				</Button>
				<DisconnectGitHubExpander connection={ connection } />
			</div>
		</Card>
	);
};
