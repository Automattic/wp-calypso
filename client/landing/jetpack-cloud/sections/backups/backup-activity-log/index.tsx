/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
// import ActivityCardList from 'landing/jetpack-cloud/components/activity-card-list';
import DocumentHead from 'components/data/document-head';
// import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { addQueryArgs } from 'lib/url';
import { backupActivityPath } from '../paths';
import FilterBar from 'landing/jetpack-cloud/components/filter-bar';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	after?: string;
	before?: string;
	group?: string;
	page?: string;
}

interface Filter {
	group?: string[];
	after?: string;
	before?: string;
	page: number;
}

const BackupActivityLogPage: FunctionComponent< Props > = ( {
	after,
	before,
	group,
	page: pageNumber = '1',
} ) => {
	const translate = useTranslate();

	const filter: Filter = {
		after,
		before,
		group: group?.split( ',' ),
		page: parseInt( pageNumber ),
	};

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const logs = useSelector( () => getHttpData( getRequestActivityLogsId( siteId, filter ) ).data );

	const onFilterChange = ( newFilter: Filter ) => {
		page(
			addQueryArgs(
				{ ...newFilter, group: newFilter.group?.join( ',' ) },
				backupActivityPath( siteSlug )
			)
		);
	};

	const render = ( loadedSiteId: number ) => (
		<div className="backup-activity-log__content">
			<div className="backup-activity-log__header">
				<h3>{ translate( 'Find a backup or restore point' ) }</h3>
				<p>
					{ translate(
						'This is the complete event history for your site. Filter by date range and/or activity type.'
					) }
				</p>
			</div>
			<FilterBar siteId={ loadedSiteId } filter={ filter } onFilterChange={ onFilterChange } />
			{ /* placeholder rendering */ }
			<p>{ `logs length: ${ logs && logs.length }` }</p>
		</div>
	);

	// when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	return (
		<Main className="backup-activity-log">
			<DocumentHead title="Activity log" />
			<SidebarNavigation />
			<PageViewTracker path="/backups/activity/:site" title="Activity log" />
			{ siteId && render( siteId ) }
		</Main>
	);
};

export default BackupActivityLogPage;
