/**
 * External dependencies
 */
import React from 'react';
import { connect, useDispatch, DefaultRootState } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import ThreatDialog from 'components/jetpack/threat-dialog';
import ThreatItem from 'components/jetpack/threat-item';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug, getSelectedSite } from 'state/ui/selectors';
import isRequestingJetpackScanHistory from 'state/selectors/is-requesting-jetpack-scan-history';
import getSiteScanHistory from 'state/selectors/get-site-scan-history';
import contactSupportUrl from 'lib/jetpack/contact-support-url';
import { withLocalizedMoment } from 'components/localized-moment';
import { useThreats } from 'lib/jetpack/use-threats';
import { Threat } from 'components/jetpack/threat-item/types';
import { Site } from 'my-sites/scan/types';

/**
 * Style dependencies
 */
import './style.scss';

type FilterValue = 'all' | 'fixed' | 'ignored';
type FilterOption =
	| {
			value: 'all';
			label: 'All';
	  }
	| {
			value: 'fixed';
			label: 'Fixed';
	  }
	| {
			value: 'ignored';
			label: 'Ignored';
	  };

const filterOptions: FilterOption[] = [
	{ value: 'all', label: 'All' },
	{ value: 'fixed', label: 'Fixed' },
	{ value: 'ignored', label: 'Ignored' },
];

interface ThreatStatusFilterProps {
	isPlaceholder: boolean;
	onSelect: ( ...args: any[] ) => void;
	initialSelected: FilterValue;
}

const ThreatStatusFilter: React.FC< ThreatStatusFilterProps > = ( {
	isPlaceholder,
	onSelect,
	initialSelected,
} ) => {
	return isPlaceholder ? (
		<div className="threat-history-list__filters is-placeholder"></div>
	) : (
		<SimplifiedSegmentedControl
			className="threat-history-list__filters"
			options={ filterOptions }
			onSelect={ onSelect }
			initialSelected={ initialSelected }
			primary
		/>
	);
};

const mapStateToProps = ( state: DefaultRootState ) => {
	const site = getSelectedSite( state ) as Site;
	const siteId = site.ID;
	const siteName = site.name;
	const siteSlug = getSelectedSiteSlug( state ) as string;
	const isRequestingHistory = isRequestingJetpackScanHistory( state, siteId );
	const siteLogEntries = getSiteScanHistory( state, siteId );

	const showPlaceholders = !! isRequestingHistory && 0 === siteLogEntries.length;
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
		threats: logEntries as Threat[],
	};
};

const mapDispatchToProps = { dispatchRecordTracksEvent: recordTracksEvent };

interface ExternalProps {
	filter: FilterValue;
}

type ConnectedProps = typeof mapDispatchToProps & ReturnType< typeof mapStateToProps >;
type Props = ExternalProps & ConnectedProps;

const ThreatHistoryList: React.FC< Props > = ( {
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
		( filterEntry: FilterOption ) => {
			let filterValue: FilterValue | '' = filterEntry.value;
			if ( 'all' === filterValue ) {
				filterValue = '';
			}
			dispatchRecordTracksEvent( 'calypso_jetpack_scan_history_filter', {
				site_id: siteId,
				filter: filterValue,
			} );
			page.show( `/scan/history/${ siteSlug }/${ filterValue }` );
		},
		[ dispatchRecordTracksEvent, siteId, siteSlug ]
	);

	const openDialog = React.useCallback(
		( threat ) => {
			const eventName = 'calypso_jetpack_scan_fixthreat_dialogopen';
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
		<div className="threat-history-list">
			<QueryJetpackScanHistory siteId={ siteId } />
			{ threats.length > 0 && (
				<div className="threat-history-list__filters-wrapper">
					<ThreatStatusFilter
						isPlaceholder={ isRequestingHistory }
						initialSelected={ currentFilter.value }
						onSelect={ handleOnFilterChange }
					/>
				</div>
			) }
			<div className="threat-history-list__entries">
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
						siteName={ siteName }
						threat={ selectedThreat }
						action={ 'fix' }
					/>
				) }
			</div>
		</div>
	);
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withLocalizedMoment( ThreatHistoryList ) );
