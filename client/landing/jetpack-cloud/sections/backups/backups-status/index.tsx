/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { emptyFilter } from 'state/activity-log/reducer';
import { getHttpData } from 'state/data-layer/http-data';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestActivityLogs, getRequestActivityLogsId } from 'state/data-getters';
import { setFilter } from 'state/activity-log/actions';
import { useApplySiteOffset } from 'landing/jetpack-cloud/components/site-offset';
import DocumentHead from 'components/data/document-head';
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryRewindCapabilities from 'components/data/query-rewind-capabilities';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySitePurchases from 'components/data/query-site-purchases';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { Activity, createIndexedLog, IndexedActivities } from './utils';
import Content from './content';
import { useLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	date?: string;
}

const BackupsStatusPage: FunctionComponent< Props > = ( { date } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();

	const siteId = useSelector( getSelectedSiteId );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const { data: logs } = useSelector( () =>
		getHttpData( getRequestActivityLogsId( siteId, filter ) )
	);

	// clear filer when we first load for a new site
	useEffect( () => {
		// skipUrlUpdate prevents this action from trigger a redirect back to backups/activity in state/navigation/middleware.js
		dispatch( { ...setFilter( siteId, emptyFilter ), meta: { skipUrlUpdate: true } } );
	}, [ dispatch, siteId ] );

	// when the filter changes, re-request the logs
	useEffect( () => {
		requestActivityLogs( siteId, filter );
	}, [ filter, siteId ] );

	// generate a new indexed log when we change sites and get the log results back
	const indexedLogs: IndexedActivities | null = useMemo(
		() =>
			logs && applySiteOffset ? createIndexedLog( logs as Activity[], applySiteOffset ) : null,
		[ logs, applySiteOffset ]
	);

	const selectedDate = applySiteOffset ? applySiteOffset( date ?? moment() ) : null;

	const render = () => {
		if ( indexedLogs && selectedDate ) {
			return <Content indexedLogs={ indexedLogs } selectedDate={ selectedDate } />;
		}
		return null;
	};

	return (
		<Main className="backups-status">
			<DocumentHead title={ translate( 'Latest Backups' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/backups/:site" title="Backups" />

			<QueryRewindState siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<QueryRewindCapabilities siteId={ siteId } />
			{ render() }
		</Main>
	);
};

export default BackupsStatusPage;
