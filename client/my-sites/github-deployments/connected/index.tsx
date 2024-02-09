import { Card } from '@automattic/components';
import { IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useState } from 'react';
import { GitHubBrowseRepositories } from 'calypso/my-sites/github-deployments/connected/repositories/browse-repositories';
import { GitHubConnectRepository } from 'calypso/my-sites/github-deployments/connected/repositories/connect-repository';
import { GitHubLoadingPlaceholder } from 'calypso/my-sites/github-deployments/loading-placeholder';
import { GitHubAccountData } from '../use-github-accounts-query';
import { GitHubRepositoryData, useGithubRepositoriesQuery } from '../use-github-repositories-query';

import './style.scss';

interface GitHubConnectedProps {
	accounts: GitHubAccountData[];
}

export const GitHubConnected = ( { accounts }: GitHubConnectedProps ) => {
	const [ repository, setRepository ] = useState< GitHubRepositoryData | undefined >();

	const { data: repositories = [], isLoading: isLoadingRepositories } =
		useGithubRepositoriesQuery();

	function renderBody() {
		if ( repository ) {
			return (
				<GitHubConnectRepository repository={ repository } goBack={ () => setRepository( null ) } />
			);
		}
		if ( isLoadingRepositories ) {
			return <GitHubLoadingPlaceholder />;
		}
		return (
			<GitHubBrowseRepositories
				repositories={ repositories }
				accounts={ accounts }
				onSelectRepository={ setRepository }
			/>
		);
	}

	function handleBack() {
		if ( repository ) {
			setRepository( null );
		} else {
			//todo where to go back to?
		}
	}

	return (
		<Card className="github-deployments-authorized-card">
			<div className="github-deployments-authorized-card__header">
				<IconButton icon={ arrowLeft } onClick={ handleBack }>
					{ __( 'Back' ) }
				</IconButton>
				<span>{ __( ' Connect repository' ) }</span>
			</div>
			<div className="github-deployments-authorized-card__body">{ renderBody() }</div>
		</Card>
	);
};
