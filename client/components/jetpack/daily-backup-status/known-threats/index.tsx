import { isFlagged } from '@automattic/api-core';
import {
	siteBackupKnownThreatsQuery,
	siteBackupsKnownThreatsPageQuery,
	siteBackupThreatsQuery,
} from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { Button as CalypsoButton, Gridicon } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Button, Spinner, Tooltip, VisuallyHidden } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useApplySiteOffset } from 'calypso/components/site-offset';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import { SUCCESSFUL_BACKUP_ACTIVITIES } from 'calypso/lib/jetpack/backup-utils';
import { backupRestorePath } from 'calypso/my-sites/backup/paths';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { findRewindIdForBackupPeriod, getNextBackupPeriod } from './find-rewind-id';
import type { BackupThreat, BackupThreats } from '@automattic/api-core';
import type { ReactNode } from 'react';

import './style.scss';

interface RestoreThatOneInsteadLinkProps {
	siteId: number;
	siteSlug: string;
	latestWithoutKnownThreats?: number | null;
	/** The backup period containing the backup being viewed, if known. */
	currentBackupPeriod?: number | null;
}

export function RestoreThatOneInsteadLink( {
	siteId,
	siteSlug,
	latestWithoutKnownThreats,
	currentBackupPeriod,
}: RestoreThatOneInsteadLinkProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const applySiteOffset = useApplySiteOffset();
	const descriptionId = useId();

	const hasTarget =
		latestWithoutKnownThreats !== null &&
		latestWithoutKnownThreats !== undefined &&
		currentBackupPeriod !== latestWithoutKnownThreats;

	// The known backup periods (already cached by the known-threats lookup) bound the search: anything
	// at or after the next backup period belongs to that later backup.
	const { data: firstPage, isFetched: hasFetchedPeriods } = useQuery( {
		...siteBackupsKnownThreatsPageQuery( siteId, 1 ),
		enabled: hasTarget && !! siteId,
	} );
	const knownPeriods = firstPage?.periods ?? [];
	const dayAfter = hasTarget ? latestWithoutKnownThreats + 24 * 60 * 60 : 0;
	const nextPeriod = hasTarget
		? getNextBackupPeriod( latestWithoutKnownThreats, knownPeriods )
		: null;
	const before = nextPeriod !== null ? Math.min( nextPeriod, dayAfter ) : dayAfter;

	// The legacy restore page looks up the Activity Log activity by its own rewind id, which differs
	// from the bare backup period, so resolve it from the successful-backup activities right after it.
	const { data: activities } = useRewindableActivityLogQuery(
		siteId,
		{
			name: SUCCESSFUL_BACKUP_ACTIVITIES,
			aggregate: false,
			after: hasTarget ? new Date( latestWithoutKnownThreats * 1000 ).toISOString() : undefined,
			before: hasTarget ? new Date( before * 1000 ).toISOString() : undefined,
			sortOrder: 'asc',
			number: 10,
		},
		{
			enabled: hasTarget && !! siteId && hasFetchedPeriods,
			refetchInterval: false,
			staleTime: 60_000,
		}
	) as { data?: Parameters< typeof findRewindIdForBackupPeriod >[ 0 ] };

	if ( ! hasTarget ) {
		return null;
	}

	const resolvedRewindId = findRewindIdForBackupPeriod(
		activities,
		latestWithoutKnownThreats,
		knownPeriods
	);
	if ( ! resolvedRewindId ) {
		return null;
	}

	// The backup's "Backup complete" time, in the site's timezone: the time the backup lists show.
	const completedAt = moment( Number( resolvedRewindId ) * 1000 );
	const siteCompletedAt = applySiteOffset ? applySiteOffset( completedAt ) : completedAt;

	const reason = translate( "It's the most recent backup with no known security threats." );

	return (
		<>
			<Tooltip text={ String( reason ) }>
				<Button
					__next40pxDefaultSize
					variant="link"
					className="backup-known-threats__restore-link"
					aria-describedby={ descriptionId }
					href={ backupRestorePath( siteSlug, resolvedRewindId ) }
				>
					{ translate( 'Restore %(date)s at %(time)s backup instead', {
						args: { date: siteCompletedAt.format( 'll' ), time: siteCompletedAt.format( 'LT' ) },
						comment:
							'%(date)s is the date of a backup, e.g. "Oct 17, 2026"; %(time)s its time, e.g. "2:30 PM". Reads "Restore Oct 17, 2026 at 2:30 PM backup instead".',
					} ) }
				</Button>
			</Tooltip>
			<VisuallyHidden id={ descriptionId }>{ reason }</VisuallyHidden>
		</>
	);
}

interface BackupKnownThreatsTableProps {
	siteId: number;
	siteSlug: string;
	threats: BackupThreats;
	latestWithoutKnownThreats?: number | null;
	/** The backup period containing the backup being viewed, if known. */
	currentBackupPeriod?: number | null;
	showRestoreLink?: boolean;
}

export function BackupKnownThreatsTable( {
	siteId,
	siteSlug,
	threats,
	latestWithoutKnownThreats,
	currentBackupPeriod,
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
				<VisuallyHidden as="caption">
					{ translate( 'Known threats in this backup' ) }
				</VisuallyHidden>
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
					siteId={ siteId }
					siteSlug={ siteSlug }
					latestWithoutKnownThreats={ latestWithoutKnownThreats }
					currentBackupPeriod={ currentBackupPeriod }
				/>
			) }
		</div>
	);
}

interface KnownThreatsRegionProps {
	id: string;
	isError: boolean;
	/** The threats table, once loaded. */
	children?: ReactNode;
}

/** What an open Known threats toggle controls: the table, or why it isn't there yet. */
export function KnownThreatsRegion( { id, isError, children }: KnownThreatsRegionProps ) {
	const translate = useTranslate();

	let content = children;
	if ( ! content ) {
		content = isError ? (
			<p className="backup-known-threats__status">
				{ translate( "Couldn't load the threats. Try again later." ) }
			</p>
		) : (
			<p className="backup-known-threats__status">
				<Spinner />
				<span>{ translate( 'Loading threats…' ) }</span>
			</p>
		);
	}

	return (
		<div id={ id } className="backup-known-threats__region">
			{ content }
		</div>
	);
}

export function useBackupKnownThreats( siteId: number, rewindId?: string | null ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const detailsId = useId();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasScan = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);
	const { data: counts } = useQuery( {
		...siteBackupKnownThreatsQuery( siteId, rewindId ?? '' ),
		enabled: !! rewindId,
	} );
	const { data: threats, isError: isThreatsError } = useQuery( {
		...siteBackupThreatsQuery( siteId, counts?.backupPeriod ?? 0 ),
		enabled: !! rewindId && hasScan && isOpen && counts?.backupPeriod != null,
	} );

	const flagged =
		!! rewindId && !! counts?.knownThreats && isFlagged( counts.knownThreats )
			? counts.knownThreats.flagged
			: null;

	return {
		siteId,
		rewindId,
		flagged,
		hasScan,
		isOpen,
		toggle: () => setIsOpen( ( open ) => ! open ),
		threats,
		isThreatsError,
		detailsId,
		siteSlug,
		latestWithoutKnownThreats: counts?.latestWithoutKnownThreats,
		backupPeriod: counts?.backupPeriod,
	};
}

type BackupKnownThreatsState = ReturnType< typeof useBackupKnownThreats >;

export function KnownThreatsBadge( { flagged }: { flagged: number } ) {
	const translate = useTranslate();

	return (
		<span className="backup-known-threats__badge">
			<Gridicon icon="notice-outline" size={ 16 } aria-hidden="true" />
			{ translate( 'Known threats (%d)', {
				args: flagged,
				comment: '%d is the number of known security threats in a backup',
			} ) }
		</span>
	);
}

export function getKnownThreatsWarning(
	translate: ReturnType< typeof useTranslate >,
	count: number
) {
	return translate(
		'This backup is known to contain %d security threat. Restoring it may bring malware back to your site.',
		'This backup is known to contain %d security threats. Restoring it may bring malware back to your site.',
		{
			count,
			args: count,
			comment: '%d is the number of known security threats in the backup',
		}
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
	/** The id of the region the toggle shows; referenced only while it is open. */
	controlsId?: string;
	/** Render a compact borderless button, matching the buttons in the activity card toolbar. */
	inToolbar?: boolean;
}

export function KnownThreatsToggleButton( {
	flagged,
	isOpen,
	onToggle,
	controlsId,
	inToolbar,
}: KnownThreatsToggleButtonProps ) {
	const translate = useTranslate();
	const warningId = useId();
	const actionLabel = isOpen ? translate( 'Hide threats' ) : translate( 'Show threats' );
	// In the card toolbar the warning isn't shown nearby, so screen readers get it as the description.
	const warning = inToolbar ? getKnownThreatsWarning( translate, flagged ) : null;
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
		<>
			<Tooltip text={ String( actionLabel ) }>
				{ inToolbar ? (
					<CalypsoButton
						compact
						borderless
						className="backup-known-threats__toggle"
						aria-label={ String( ariaLabel ) }
						aria-expanded={ isOpen }
						aria-controls={ isOpen ? controlsId : undefined }
						aria-describedby={ warningId }
						onClick={ onToggle }
					>
						<KnownThreatsBadge flagged={ flagged } />
					</CalypsoButton>
				) : (
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						size="compact"
						className="backup-known-threats__toggle"
						aria-label={ String( ariaLabel ) }
						aria-expanded={ isOpen }
						aria-controls={ isOpen ? controlsId : undefined }
						onClick={ onToggle }
					>
						<KnownThreatsBadge flagged={ flagged } />
					</Button>
				) }
			</Tooltip>
			{ warning && <VisuallyHidden id={ warningId }>{ warning }</VisuallyHidden> }
		</>
	);
}

export function BackupKnownThreatsToggle( { state, inToolbar }: BackupKnownThreatsToggleProps ) {
	const { flagged, hasScan, isOpen, toggle, detailsId } = state;

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
			controlsId={ detailsId }
			inToolbar={ inToolbar }
		/>
	);
}

export function BackupKnownThreatsRestoreLink( { state }: { state: BackupKnownThreatsState } ) {
	const { flagged, siteId, siteSlug, latestWithoutKnownThreats, backupPeriod } = state;

	if ( flagged === null || ! siteSlug ) {
		return null;
	}

	return (
		<RestoreThatOneInsteadLink
			siteId={ siteId }
			siteSlug={ siteSlug }
			latestWithoutKnownThreats={ latestWithoutKnownThreats }
			currentBackupPeriod={ backupPeriod }
		/>
	);
}

/** The threats table, shown once expanded. The restore link lives in BackupKnownThreatsRestoreLink. */
export function BackupKnownThreatsDetails( {
	state,
	showWarning = false,
}: {
	state: BackupKnownThreatsState;
	/** Show the warning above the table, where it isn't shown nearby. */
	showWarning?: boolean;
} ) {
	const translate = useTranslate();
	const {
		flagged,
		hasScan,
		isOpen,
		threats,
		isThreatsError,
		detailsId,
		siteId,
		siteSlug,
		latestWithoutKnownThreats,
		backupPeriod,
	} = state;

	if ( flagged === null || ! hasScan || ! isOpen ) {
		return null;
	}

	return (
		<>
			{ showWarning && (
				<p className="backup-known-threats__warning">
					{ getKnownThreatsWarning( translate, flagged ) }
				</p>
			) }
			<KnownThreatsRegion id={ detailsId } isError={ isThreatsError || ! siteSlug }>
				{ threats && siteSlug && (
					<BackupKnownThreatsTable
						siteId={ siteId }
						siteSlug={ siteSlug }
						threats={ threats }
						latestWithoutKnownThreats={ latestWithoutKnownThreats }
						currentBackupPeriod={ backupPeriod }
						showRestoreLink={ false }
					/>
				) }
			</KnownThreatsRegion>
		</>
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
			<BackupKnownThreatsDetails state={ state } />
			{ showRestoreLink && <BackupKnownThreatsRestoreLink state={ state } /> }
		</div>
	);
}
