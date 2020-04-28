/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import ScanHistoryItem from 'landing/jetpack-cloud/components/scan-history-item';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import isRequestingJetpackScanHistory from 'state/selectors/is-requesting-jetpack-scan-history';
import getSiteScanHistory from 'state/selectors/get-site-scan-history';
/**
 * Style dependencies
 */
import './style.scss';

const filterOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'fixed', label: 'Fixed' },
	{ value: 'ignored', label: 'Ignored' },
];

class ScanHistoryPage extends Component {
	getCurrentFilter = () => {
		const { filter } = this.props;

		if ( filter ) {
			return filterOptions.find( ( { value } ) => value === filter ) || filterOptions[ 0 ];
		}
		return filterOptions[ 0 ];
	};

	handleOnFilterChange = ( filter ) => {
		const { siteSlug, siteId, dispatchRecordTracksEvent } = this.props;
		let filterValue = filter.value;
		if ( 'all' === filterValue ) {
			filterValue = '';
		}
		dispatchRecordTracksEvent( 'calypso_scan_history_filter_update', {
			site_id: siteId,
			filter: filterValue,
		} );
		page.show( `/scan/history/${ siteSlug }/${ filterValue }` );
	};

	filteredEntries() {
		const { logEntries } = this.props;
		const { value: filter } = this.getCurrentFilter();
		if ( filter === 'all' ) {
			return logEntries;
		}
		return logEntries.filter( ( entry ) => entry.status === filter );
	}

	render() {
		const logEntries = this.filteredEntries();
		const { value: filter } = this.getCurrentFilter();
		return (
			<Main className="history">
				<DocumentHead title={ translate( 'History' ) } />
				<SidebarNavigation />
				<QueryJetpackScanHistory siteId={ this.props.siteId } />
				<PageViewTracker path="/scan/history/:site" title="Scan History" />
				<h1 className="history__header">{ translate( 'History' ) }</h1>
				<p className="history__description">
					{ translate(
						'The scanning history contains a record of all previously active threats on your site.'
					) }
				</p>
				<div className="history__filters-wrapper">
					<SimplifiedSegmentedControl
						className="history__filters"
						options={ filterOptions }
						onSelect={ this.handleOnFilterChange }
						initialSelected={ filter }
					/>
				</div>
				<div className="history__entries">
					{ logEntries.map( ( entry ) => (
						<ScanHistoryItem
							threat={ entry }
							key={ entry.id }
							isPlaceholder={ this.props.isRequestingHistory }
						/>
					) ) }
				</div>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isRequestingHistory = isRequestingJetpackScanHistory( state, siteId );

		const logEntries = isRequestingHistory
			? [
					{ id: 1, status: 'fixed' },
					{ id: 2, status: 'ignored' },
					{ id: 3, status: 'fixed' },
					{ id: 4, status: 'ignored' },
			  ]
			: getSiteScanHistory( state, siteId );

		return {
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
			isRequestingHistory,
			logEntries,
		};
	},
	{ dispatchRecordTracksEvent: recordTracksEvent }
)( ScanHistoryPage );
