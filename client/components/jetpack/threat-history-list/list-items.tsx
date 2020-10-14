/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { useThreats } from 'calypso/lib/jetpack/use-threats';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import ThreatItem, { ThreatItemPlaceholder } from 'calypso/components/jetpack/threat-item';
import ThreatDialog from 'calypso/components/jetpack/threat-dialog';

const trackOpenThreatDialog = ( siteId: number, threatSignature: string ) =>
	recordTracksEvent( 'calypso_jetpack_scan_fixthreat_dialogopen', {
		site_id: siteId,
		threat_signature: threatSignature,
	} );

const ListItems = ( { items } ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteName = useSelector( ( state ) => getSelectedSite( state )?.name );

	const { selectedThreat, setSelectedThreat, updateThreat, updatingThreats } = useThreats( siteId );
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );

	const openDialog = useCallback(
		( threat ) => {
			dispatch( trackOpenThreatDialog( siteId, threat.signature ) );
			setSelectedThreat( threat );
			setShowThreatDialog( true );
		},
		[ dispatch, setSelectedThreat, siteId ]
	);
	const closeDialog = useCallback( () => {
		setShowThreatDialog( false );
	}, [ setShowThreatDialog ] );
	const fixThreat = useCallback( () => {
		closeDialog();
		updateThreat( 'fix' );
	}, [ closeDialog, updateThreat ] );

	return (
		<>
			{ items.map( ( threat ) => (
				<ThreatItem
					key={ threat.id }
					isPlaceholder={ false }
					threat={ threat }
					onFixThreat={ openDialog }
					isFixing={ !! updatingThreats.find( ( threatId ) => threatId === threat.id ) }
					contactSupportUrl={ contactSupportUrl( siteSlug ) }
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
		</>
	);
};

export default ListItems;

export const ListItemsPlaceholder = ( { count, perPage } ) => {
	const showPagination = count > perPage;
	const itemsToShow = Math.min( count, perPage );

	const fakeItems = Array.from( Array( itemsToShow ).keys() ).map( ( i ) => (
		<ThreatItemPlaceholder key={ i } />
	) );

	const isMobile = useMobileBreakpoint();

	return (
		<>
			{ showPagination && (
				<div
					className={ classNames( 'threat-history-list__pagination--top', 'is-placeholder', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
			{ fakeItems }
			{ showPagination && (
				<div
					className={ classNames( 'threat-history-list__pagination--bottom', 'is-placeholder', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
		</>
	);
};
