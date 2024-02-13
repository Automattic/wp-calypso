import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useState } from 'react';
import { GitHubConnectRepository } from 'calypso/my-sites/github-deployments/connect/connect-repository';
import { GitHubBrowseRepositories } from 'calypso/my-sites/github-deployments/connect/repositories/browse-repositories';
import { GitHubAccountData } from '../use-github-accounts-query';
import { GitHubRepositoryData } from '../use-github-repositories-query';

import './style.scss';

interface GitHubConnectedProps {
	accounts: GitHubAccountData[];
	onBack(): void;
}

export const GitHubConnect = ( { accounts, onBack }: GitHubConnectedProps ) => {
	const [ repository, setRepository ] = useState< GitHubRepositoryData | null >( null );
	const [ account, setAccount ] = useState( accounts[ 0 ] );

	function renderBody() {
		if ( repository ) {
			return (
				<GitHubConnectRepository
					account={ account }
					repository={ repository }
					goBack={ () => setRepository( null ) }
					onConnected={ onBack }
				/>
			);
		}

		return (
			<GitHubBrowseRepositories
				accounts={ accounts }
				account={ account }
				onSelectRepository={ setRepository }
				onChangeAccount={ setAccount }
			/>
		);
	}

	function handleBack() {
		if ( repository ) {
			setRepository( null );
		} else {
			onBack();
		}
	}

	return (
		<Card className="github-deployments-authorized-card">
			<div className="github-deployments-authorized-card__header">
				<Button icon={ arrowLeft } onClick={ handleBack }>
					{ __( 'Back' ) }
				</Button>
				<span>{ __( ' Connect repository' ) }</span>
			</div>
			<div className="github-deployments-authorized-card__body">{ renderBody() }</div>
		</Card>
	);
};
