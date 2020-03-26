/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DocumentHead from 'components/data/document-head';

const BackupActivityLogPage: FunctionComponent = () => {
	const render = () => {
		return <div>{ 'welcome to activity-log!' }</div>;
	};

	return (
		<Main>
			<DocumentHead title="Backup Details" />
			<SidebarNavigation />
			{ render() }
		</Main>
	);
};

export default BackupActivityLogPage;
