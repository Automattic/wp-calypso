import { getBackupPeriod, isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { Badge, Button as CalypsoButton, Gridicon } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button, Tooltip } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { backupRestorePath } from 'calypso/my-sites/backup/paths';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { BackupThreat, BackupThreats } from '@automattic/api-core';

import './style.scss';

interface RestoreThatOneInsteadLinkProps {
	siteSlug: string;
	latestWithoutKnownThreats?: number | null;
	currentRewindId?: string;
}

export function RestoreThatOneInsteadLink( {
	siteSlug,
	latestWithoutKnownThreats,
	currentRewindId,
}: RestoreThatOneInsteadLinkProps ) {
	const translate = useTranslate();

	if ( latestWithoutKnownThreats === null || latestWithoutKnownThreats === undefined ) {
		return null;
	}

	if (
		currentRewindId !== undefined &&
		getBackupPeriod( currentRewindId ) === latestWithoutKnownThreats
	) {
		return null;
	}

	return (
		<Button
			__next40pxDefaultSize
			variant="link"
			href={ backupRestorePath( siteSlug, String( latestWithoutKnownThreats ) ) }
		>
			{ translate( 'Restore that one instead' ) }
		</Button>
	);
}

interface BackupKnownThreatsTableProps {
	siteSlug: string;
	threats: BackupThreats;
	latestWithoutKnownThreats?: number | null;
	currentRewindId?: string;
	showRestoreLink?: boolean;
}

export function BackupKnownThreatsTable( {
	siteSlug,
	threats,
	latestWithoutKnownThreats,
	currentRewindId,
	showRestoreLink = true,
}: BackupKnownThreatsTableProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const rows = threats.threats.filter( ( threat ) => threat.kind !== 'vulnerable' );

	const formatDate = ( value: string | null ) =>
		value ? moment.utc( value ).local().format( 'll' ) : '';

	const getWhere = ( threat: BackupThreat ) =>
		threat.slug ? `${ threat.slug }@${ threat.version ?? '' }` : ( threat.path ?? threat.target );

	const getStatus = ( threat: BackupThreat ) => {
		if ( threat.state === 'fixed' ) {
			return translate( 'Fixed %s', {
				args: formatDate( threat.fixed_on ),
				comment: '%s is a localised date',
			} );
		}
		return threat.status === 'ignored' ? translate( 'Ignored' ) : translate( 'Open' );
	};

	return (
		<div className="backup-known-threats__details">
			<table className="backup-known-threats__table">
				<thead>
					<tr>
						<th>{ translate( 'Threat' ) }</th>
						<th>{ translate( 'Where' ) }</th>
						<th>{ translate( 'First detected' ) }</th>
						<th>{ translate( 'Status now' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ rows.map( ( threat ) => (
						<tr key={ threat.id }>
							<td>{ threat.signature ?? threat.kind }</td>
							<td>{ getWhere( threat ) }</td>
							<td>{ formatDate( threat.reported_on ) }</td>
							<td>{ getStatus( threat ) }</td>
						</tr>
					) ) }
				</tbody>
			</table>
			{ threats.summary.vulnerable > 0 && (
				<p>
					{ translate(
						'Also: %d vulnerable plugin or theme version.',
						'Also: %d vulnerable plugin or theme versions.',
						{
							count: threats.summary.vulnerable,
							args: threats.summary.vulnerable,
							comment: '%d is the number of vulnerable plugin or theme versions',
						}
					) }
				</p>
			) }
			{ showRestoreLink && (
				<RestoreThatOneInsteadLink
					siteSlug={ siteSlug }
					latestWithoutKnownThreats={ latestWithoutKnownThreats }
					currentRewindId={ currentRewindId }
				/>
			) }
		</div>
	);
}

export function useBackupKnownThreats( siteId: number, rewindId?: string | null ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasScan = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);
	const { data: counts } = useQuery( {
		...siteBackupKnownThreatsQuery( siteId, rewindId ?? '' ),
		enabled: !! rewindId,
	} );
	const { data: threats } = useQuery( {
		...siteBackupThreatsQuery( siteId, counts?.backupPeriod ?? 0 ),
		enabled: !! rewindId && hasScan && isOpen && counts?.backupPeriod != null,
	} );

	const flagged =
		!! rewindId && !! counts?.knownThreats && isFlagged( counts.knownThreats )
			? counts.knownThreats.flagged
			: null;

	return {
		rewindId,
		flagged,
		hasScan,
		isOpen,
		toggle: () => setIsOpen( ( open ) => ! open ),
		threats,
		siteSlug,
		latestWithoutKnownThreats: counts?.latestWithoutKnownThreats,
	};
}

type BackupKnownThreatsState = ReturnType< typeof useBackupKnownThreats >;

export function KnownThreatsBadge( { flagged }: { flagged: number } ) {
	const translate = useTranslate();

	return (
		<Badge type="warning" className="backup-known-threats__badge">
			<Gridicon icon="notice-outline" size={ 16 } aria-hidden="true" />
			{ translate( 'Known threats (%d)', {
				args: flagged,
				comment: '%d is the number of known security threats in a backup',
			} ) }
		</Badge>
	);
}

interface BackupKnownThreatsToggleProps {
	state: BackupKnownThreatsState;
	/** Render a compact borderless button, matching the buttons in the activity card toolbar. */
	inToolbar?: boolean;
}

interface KnownThreatsToggleButtonProps {
	flagged: number;
	isOpen: boolean;
	onToggle: () => void;
	/** Render a compact borderless button, matching the buttons in the activity card toolbar. */
	inToolbar?: boolean;
}

export function KnownThreatsToggleButton( {
	flagged,
	isOpen,
	onToggle,
	inToolbar,
}: KnownThreatsToggleButtonProps ) {
	const translate = useTranslate();
	const actionLabel = isOpen ? translate( 'Hide threats' ) : translate( 'Show threats' );
	const ariaLabel = isOpen
		? translate( 'Known threats (%d), hide threats', {
				args: flagged,
				comment:
					'%d is the number of known security threats in a backup; the button hides the list of threats',
			} )
		: translate( 'Known threats (%d), show threats', {
				args: flagged,
				comment:
					'%d is the number of known security threats in a backup; the button shows the list of threats',
			} );

	return (
		<Tooltip text={ String( actionLabel ) }>
			{ inToolbar ? (
				<CalypsoButton
					compact
					borderless
					aria-label={ String( ariaLabel ) }
					aria-expanded={ isOpen }
					onClick={ onToggle }
				>
					<KnownThreatsBadge flagged={ flagged } />
				</CalypsoButton>
			) : (
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					size="compact"
					aria-label={ String( ariaLabel ) }
					aria-expanded={ isOpen }
					onClick={ onToggle }
				>
					<KnownThreatsBadge flagged={ flagged } />
				</Button>
			) }
		</Tooltip>
	);
}

export function BackupKnownThreatsToggle( { state, inToolbar }: BackupKnownThreatsToggleProps ) {
	const { flagged, hasScan, isOpen, toggle } = state;

	if ( flagged === null ) {
		return null;
	}

	if ( ! hasScan ) {
		return <KnownThreatsBadge flagged={ flagged } />;
	}

	return (
		<KnownThreatsToggleButton
			flagged={ flagged }
			isOpen={ isOpen }
			onToggle={ toggle }
			inToolbar={ inToolbar }
		/>
	);
}

interface BackupKnownThreatsDetailsProps {
	state: BackupKnownThreatsState;
	showRestoreLink?: boolean;
}

export function BackupKnownThreatsDetails( {
	state,
	showRestoreLink = true,
}: BackupKnownThreatsDetailsProps ) {
	const { flagged, hasScan, isOpen, threats, siteSlug, latestWithoutKnownThreats, rewindId } =
		state;

	if ( flagged === null || ! hasScan || ! isOpen || ! threats || ! siteSlug ) {
		return null;
	}

	return (
		<BackupKnownThreatsTable
			siteSlug={ siteSlug }
			threats={ threats }
			latestWithoutKnownThreats={ latestWithoutKnownThreats }
			currentRewindId={ rewindId ?? undefined }
			showRestoreLink={ showRestoreLink }
		/>
	);
}

interface BackupKnownThreatsProps {
	siteId: number;
	rewindId?: string | null;
	showRestoreLink?: boolean;
}

export function BackupKnownThreats( {
	siteId,
	rewindId,
	showRestoreLink = true,
}: BackupKnownThreatsProps ) {
	const state = useBackupKnownThreats( siteId, rewindId );

	if ( state.flagged === null ) {
		return null;
	}

	return (
		<div className="backup-known-threats">
			<BackupKnownThreatsToggle state={ state } />
			<BackupKnownThreatsDetails state={ state } showRestoreLink={ showRestoreLink } />
		</div>
	);
}
