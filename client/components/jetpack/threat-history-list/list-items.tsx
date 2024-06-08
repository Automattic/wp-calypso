import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useState, useCallback } from 'react';
import ThreatDialog from 'calypso/components/jetpack/threat-dialog';
import ThreatItem, { ThreatItemPlaceholder } from 'calypso/components/jetpack/threat-item';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { useThreats } from 'calypso/lib/jetpack/use-threats';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import type { Threat } from 'calypso/components/jetpack/threat-item/types';

const trackOpenThreatDialog = ( siteId: number, threatSignature: string ) =>
	recordTracksEvent( 'calypso_jetpack_scan_fixthreat_dialogopen', {
		site_id: siteId,
		threat_signature: threatSignature,
	} );

const ListItems = ( { items }: { items: Threat[] } ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteName = useSelector( ( state ) => getSelectedSite( state )?.name );

	const { selectedThreat, setSelectedThreat, updateThreat, updatingThreats } = useThreats(
		siteId ?? 0
	);
	const [ showThreatDialog, setShowThreatDialog ] = useState( false );

	const openDialog = useCallback(
		( threat: Threat ) => {
			dispatch( trackOpenThreatDialog( siteId ?? 0, threat.signature ) );
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
					siteName={ siteName ?? '' }
					threat={ selectedThreat }
					action="fix"
				/>
			) }
		</>
	);
};

export default ListItems;

export const ListItemsPlaceholder = ( { count, perPage }: { count: number; perPage: number } ) => {
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
					className={ clsx( 'threat-history-list__pagination--top', 'is-placeholder', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
			{ fakeItems }
			{ showPagination && (
				<div
					className={ clsx( 'threat-history-list__pagination--bottom', 'is-placeholder', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
		</>
	);
};
