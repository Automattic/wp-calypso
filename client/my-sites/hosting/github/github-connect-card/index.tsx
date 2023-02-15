import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import CardHeading from 'calypso/components/card-heading';
import { DisconnectGitHubExpander } from '../disconnect-github-expander';
import iconGitHub from '../github.svg';
import type { ComponentProps } from 'react';

interface GithubConnectCardProps {
	connection: ComponentProps< typeof DisconnectGitHubExpander >[ 'connection' ];
}

// todo - just a placeholder for now as the implementation of this
// component falls under another PR.
export const GithubConnectCard = ( { connection }: GithubConnectCardProps ) => {
	const { __ } = useI18n();
	return (
		<Card className="github-hosting-card">
			<img className="github-hosting-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ __( 'Connect branch' ) }</CardHeading>
			<DisconnectGitHubExpander connection={ connection } />
		</Card>
	);
};
