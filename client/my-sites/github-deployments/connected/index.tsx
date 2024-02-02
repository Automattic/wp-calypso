import { Card } from '@automattic/components';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GitHubAccounts } from './accounts';
import { GitHubRepositories } from './repositories';

import './style.scss';

export const GitHubConnected = () => {
	const renderTab = ( tab: { name: string } ) => {
		switch ( tab.name ) {
			case 'accounts':
				return <GitHubAccounts />;
			case 'repositories':
				return <GitHubRepositories />;
			default:
				return null;
		}
	};

	return (
		<Card className="github-deployments-authorized-card">
			<TabPanel
				initialTabName="accounts"
				tabs={ [
					{
						name: 'repositories',
						title: __( 'Repositories' ),
						className: 'tab-one',
					},
					{
						name: 'accounts',
						title: __( 'Accounts' ),
						className: 'tab-two',
					},
				] }
			>
				{ ( tab ) => renderTab( tab ) }
			</TabPanel>
		</Card>
	);
};
