import { Button, Card } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { ComponentProps, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Image from 'calypso/components/image';
import SocialLogo from 'calypso/components/social-logo';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DisconnectGitHubButton } from '../disconnect-github-button';
import { SearchBranches } from './search-branches';
import { SearchRepos } from './search-repos';
import { useGithubConnectMutation } from './use-github-connect';

import './style.scss';

interface GithubConnectCardProps {
	connection: ComponentProps< typeof DisconnectGitHubButton >[ 'connection' ];
}
const noticeOptions = {
	duration: 3000,
};

export const GithubConnectCard = ( { connection }: GithubConnectCardProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const [ selectedRepo, setSelectedRepo ] = useState< string >( '' );
	const [ selectedBranch, setSelectedBranch ] = useState< string >( '' );

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

	const disabled = ! selectedBranch || ! selectedRepo;
	const handleRepoSelect = ( repoName: string ) => {
		setSelectedRepo( repoName );
		setSelectedBranch( '' );
	};

	const handleBranchSelect = ( branchName: string ) => {
		setSelectedBranch( branchName );
	};

	const resetRepoSelection = () => {
		if ( selectedRepo ) {
			setSelectedRepo( '' );
			setSelectedBranch( '' );
		}
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

				<FormFieldset style={ { marginBottom: '24px' } }>
					<FormLabel>{ __( 'Organization' ) }</FormLabel>
					<div className="connect-branch__organization">
						{ connection.external_profile_picture && (
							<Image
								className="connect-branch__profile-picture"
								src={ connection.external_profile_picture }
							/>
						) }
						{ connection.external_name }

						<DisconnectGitHubButton connection={ connection } />
					</div>
				</FormFieldset>

				<div className="connect-branch__fields">
					<FormFieldset style={ { flex: 1 } }>
						<FormLabel htmlFor="repository">{ __( 'Repository' ) }</FormLabel>
						<SearchRepos
							siteId={ siteId }
							onSelect={ handleRepoSelect }
							onChange={ resetRepoSelection }
						/>
					</FormFieldset>
					<FormFieldset style={ { flex: 1 } }>
						<FormLabel htmlFor="branch">{ __( 'Branch' ) }</FormLabel>
						<SearchBranches
							siteId={ siteId }
							repoName={ selectedRepo }
							onSelect={ handleBranchSelect }
							selectedBranch={ selectedBranch }
						/>
					</FormFieldset>
				</div>

				<FormSettingExplanation>
					Don't see a specific repo? Try re-authorizing with Github as a different organization.
				</FormSettingExplanation>
			</div>
			<div className={ classNames( 'connect-branch__buttons' ) }>
				<Button
					primary
					onClick={ () => {
						connectBranch( {
							repoName: selectedRepo,
							branchName: selectedBranch,
						} );
					} }
					busy={ isConnecting }
					disabled={ disabled }
				>
					<span>{ __( 'Connect to repository' ) }</span>
				</Button>
			</div>
		</Card>
	);
};
