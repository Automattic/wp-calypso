/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import BackupActivityLog from 'landing/jetpack-cloud/sections/backups/components/activity-log';

const BackupActivityLogPage: FunctionComponent = () => {
	const siteId = useSelector( getSelectedSiteId );

	const render = () => {
		return (
			<div>
				<h1>{ 'welcome to activity-log!' }</h1>
				{ siteId && <BackupActivityLog siteId={ siteId } allowRestore={ false } /> }
			</div>
		);
	};

	return (
		<Main className="activity-log">
			<DocumentHead title="Activity Log" />
			<SidebarNavigation />
			{ render() }
		</Main>
	);
};

export default BackupActivityLogPage;
