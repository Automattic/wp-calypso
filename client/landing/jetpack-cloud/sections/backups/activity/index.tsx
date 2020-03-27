/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import BackupActivityLog from 'landing/jetpack-cloud/sections/backups/components/activity-log';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const BackupActivityPage: FunctionComponent = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const render = () => {
		return (
			<div>
				<h3>{ translate( 'Find a backup or restore point' ) }</h3>
				<p>
					{ translate(
						'This is the complete event history for your site. Filter by date range and/ or activity type.'
					) }
				</p>
				{ siteId && (
					<BackupActivityLog allowRestore={ false } siteId={ siteId } showDateRange={ true } />
				) }
			</div>
		);
	};

	return (
		<Main className="activity">
			<DocumentHead title="Activity Log" />
			<SidebarNavigation />
			{ render() }
		</Main>
	);
};

export default BackupActivityPage;
