/**
 * External dependencies
 */
import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { translate } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import ThreatDialog from 'landing/jetpack-cloud/components/threat-dialog';
import ThreatItem from 'landing/jetpack-cloud/components/threat-item';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug, getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import isRequestingJetpackScanHistory from 'state/selectors/is-requesting-jetpack-scan-history';
import getSiteScanHistory from 'state/selectors/get-site-scan-history';
import contactSupportUrl from 'landing/jetpack-cloud/lib/contact-support-url';
import { withLocalizedMoment } from 'components/localized-moment';
import { useThreats } from 'landing/jetpack-cloud/lib/use-threats';

/**
 * Style dependencies
 */
import './style.scss';

const filterOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'fixed', label: 'Fixed' },
	{ value: 'ignored', label: 'Ignored' },
];

const ThreatStatusFilter = ( { isPlaceholder, onSelect } ) => {
	return isPlaceholder ? (
		<div className="history__filters is-placeholder"></div>
	) : (
		<SimplifiedSegmentedControl
			className="history__filters"
			options={ filterOptions }
			onSelect={ onSelect }
		/>
	);
};

const ScanHistoryPage = ( {
	siteId,
	siteName,
	siteSlug,
	isRequestingHistory,
	threats,
	filter,
	dispatchRecordTracksEvent,
} ) => {
	const { selectedThreat, setSelectedThreat, updateThreat, updatingThreats } = useThreats( siteId );
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const dispatch = useDispatch();
	const handleOnFilterChange = React.useCallback(
		( filterEntry ) => {
			let filterValue = filterEntry.value;
			if ( 'all' === filterValue ) {
				filterValue = '';
			}
			dispatchRecordTracksEvent( 'jetpack_cloud_scan_history_filter', {
				site_id: siteId,
				filter: filterValue,
			} );
			page.show( `/scan/history/${ siteSlug }/${ filterValue }` );
		},
		[ dispatchRecordTracksEvent, siteId, siteSlug ]
	);

	const openDialog = React.useCallback(
		( threat ) => {
			const eventName = 'calypso_scan_fix_threat_dialog_open';
			dispatch(
				recordTracksEvent( eventName, {
					site_id: siteId,
					threat_signature: threat.signature,
				} )
			);
			setSelectedThreat( threat );
			setShowThreatDialog( true );
		},
		[ dispatch, setSelectedThreat, siteId ]
	);

	const closeDialog = React.useCallback( () => {
		setShowThreatDialog( false );
	}, [ setShowThreatDialog ] );

	const fixThreat = React.useCallback( () => {
		closeDialog();
		updateThreat( 'fix' );
	}, [ closeDialog, updateThreat ] );

	const currentFilter = React.useMemo( () => {
		if ( filter ) {
			return filterOptions.find( ( { value } ) => value === filter ) || filterOptions[ 0 ];
		}
		return filterOptions[ 0 ];
	}, [ filter ] );

	const filteredEntries = React.useMemo( () => {
		const { value: filterValue } = currentFilter;
		if ( filterValue === 'all' ) {
			return threats;
		}
		return threats.filter( ( entry ) => entry.status === filterValue );
	}, [ currentFilter, threats ] );

	return (
		<Main className="history">
			<DocumentHead title={ translate( 'History' ) } />
			<SidebarNavigation />
			<QueryJetpackScanHistory siteId={ siteId } />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			<h1 className="history__header">{ translate( 'History' ) }</h1>
			<p className="history__description">
				{ translate(
					'The scanning history contains a record of all previously active threats on your site.'
				) }
			</p>
			{ threats.length > 0 && (
				<div className="history__filters-wrapper">
					<ThreatStatusFilter
						isPlaceholder={ isRequestingHistory }
						onSelect={ handleOnFilterChange }
					/>
				</div>
			) }
			<div className="history__entries">
				{ filteredEntries.map( ( threat ) => (
					<ThreatItem
						key={ threat.id }
						threat={ threat }
						onFixThreat={ () => openDialog( threat ) }
						isFixing={ !! updatingThreats.find( ( threatId ) => threatId === threat.id ) }
						contactSupportUrl={ contactSupportUrl( siteSlug ) }
						isPlaceholder={ isRequestingHistory }
					/>
				) ) }
				{ selectedThreat && (
					<ThreatDialog
						showDialog={ showThreatDialog }
						onCloseDialog={ closeDialog }
						onConfirmation={ fixThreat }
						siteId={ siteId }
						siteName={ siteName }
						threat={ selectedThreat }
						action={ 'fix' }
					/>
				) }
			</div>
		</Main>
	);
};

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = site.ID;
		const siteName = site.name;
		const siteSlug = getSelectedSiteSlug( state );
		const isRequestingHistory = isRequestingJetpackScanHistory( state, siteId );
		const siteLogEntries = getSiteScanHistory( state, siteId );

		const showPlaceholders = isRequestingHistory && 0 === siteLogEntries.length;
		const logEntries = showPlaceholders
			? [
					{ id: 1, status: 'fixed' },
					{ id: 2, status: 'ignored' },
					{ id: 3, status: 'fixed' },
					{ id: 4, status: 'ignored' },
			  ]
			: siteLogEntries;
		return {
			siteId,
			siteName,
			siteSlug,
			isRequestingHistory: showPlaceholders,
			threats: logEntries,
		};
	},
	{ dispatchRecordTracksEvent: recordTracksEvent }
)( withLocalizedMoment( ScanHistoryPage ) );
