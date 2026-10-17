import { getBackupPeriod, isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
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

	const formatDate = ( value: string | null ) => ( value ? moment( value ).format( 'll' ) : '' );

	const getWhere = ( threat: BackupThreat ) =>
		threat.slug ? `${ threat.slug }@${ threat.version ?? '' }` : threat.target;

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
					{ translate( 'Also: %d vulnerable plugin or theme versions.', {
						args: threats.summary.vulnerable,
						comment: '%d is the number of vulnerable plugin or theme versions',
					} ) }
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
	const translate = useTranslate();
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
		...siteBackupThreatsQuery( siteId, rewindId ?? '' ),
		enabled: !! rewindId && hasScan && isOpen,
	} );

	if ( ! rewindId || ! counts?.knownThreats || ! isFlagged( counts.knownThreats ) ) {
		return null;
	}

	const badge = (
		<span className="backup-known-threats__badge">
			{ translate( 'Known threats (%d)', {
				args: counts.knownThreats.flagged,
				comment: '%d is the number of known security threats in a backup',
			} ) }
		</span>
	);

	if ( ! hasScan ) {
		return <div className="backup-known-threats">{ badge }</div>;
	}

	return (
		<div className="backup-known-threats">
			<Button
				variant="tertiary"
				size="compact"
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( open ) => ! open ) }
			>
				{ badge }
				<span>{ isOpen ? translate( 'Hide threats' ) : translate( 'Show threats' ) }</span>
			</Button>
			{ isOpen && threats && siteSlug && (
				<BackupKnownThreatsTable
					siteSlug={ siteSlug }
					threats={ threats }
					latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
					currentRewindId={ rewindId }
					showRestoreLink={ showRestoreLink }
				/>
			) }
		</div>
	);
}
