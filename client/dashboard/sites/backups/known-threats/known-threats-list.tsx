import { __, _n, sprintf } from '@wordpress/i18n';
import { Fragment } from 'react';
import { useIntlLocale } from '../../../app/locale';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';
import { RestoreThatOneInsteadLink } from './restore-that-one-instead-link';
import './known-threats-list.scss';
import type { BackupThreat, BackupThreats } from '@automattic/api-core';

/**
 * A path that wraps only after its slashes, never inside a file name.
 */
function breakablePath( path: string ) {
	return path.split( '/' ).map( ( segment, index, segments ) => (
		<Fragment key={ index }>
			{ segment }
			{ index < segments.length - 1 && (
				<>
					/<wbr />
				</>
			) }
		</Fragment>
	) );
}

function getThreatWhere( threat: BackupThreat ) {
	return threat.slug
		? `${ threat.slug }@${ threat.version ?? '' }`
		: ( threat.path ?? threat.target ?? '' );
}

interface KnownThreatsListProps {
	siteId: number;
	siteSlug: string;
	restoreLinkTo?: string;
	threats: BackupThreats;
	latestWithoutKnownThreats?: number | null;
	currentBackupPeriod?: number | null;
	showRestoreLink?: boolean;
}

// One threat per item, stacked, so long paths have the full width at any screen size.
export function KnownThreatsList( {
	siteId,
	siteSlug,
	restoreLinkTo,
	threats,
	latestWithoutKnownThreats,
	currentBackupPeriod,
	showRestoreLink = true,
}: KnownThreatsListProps ) {
	const locale = useIntlLocale();
	const rows = threats.threats.filter( ( threat ) => threat.kind !== 'vulnerable' );

	const formatThreatDate = ( value: string | null ) =>
		value ? formatDate( parseDateAsUTC( value ), locale ) : '';

	const getStatus = ( threat: BackupThreat ) => {
		if ( threat.state === 'fixed' ) {
			/* translators: %s is a localised date */
			return sprintf( __( 'Fixed %s' ), formatThreatDate( threat.fixed_on ) );
		}
		return threat.status === 'ignored' ? __( 'Ignored' ) : __( 'Open' );
	};

	const getDetails = ( threat: BackupThreat ) => {
		const reportedOn = formatThreatDate( threat.reported_on );
		return reportedOn
			? sprintf(
					/* translators: 1: the date Scan first detected a threat, 2: its status now, such as "Open" or "Fixed Oct 17, 2026". */
					__( 'First detected %1$s · %2$s' ),
					reportedOn,
					getStatus( threat )
				)
			: getStatus( threat );
	};

	const vulnerableNote = sprintf(
		// translators: %d is the number of vulnerable plugin or theme versions
		_n(
			'Also: %d vulnerable plugin or theme version.',
			'Also: %d vulnerable plugin or theme versions.',
			threats.summary.vulnerable
		),
		threats.summary.vulnerable
	);

	return (
		<div className="dashboard-backups__known-threats-details">
			<ul
				className="dashboard-backups__known-threats-list"
				aria-label={ __( 'Known threats in this backup' ) }
			>
				{ rows.map( ( threat ) => (
					<li key={ threat.id } className="dashboard-backups__known-threat">
						<span className="dashboard-backups__known-threat-name">
							{ threat.signature ?? threat.kind }
						</span>
						{ getThreatWhere( threat ) && (
							<span className="dashboard-backups__known-threat-where">
								<bdi>{ breakablePath( getThreatWhere( threat ) ) }</bdi>
							</span>
						) }
						<span className="dashboard-backups__known-threat-details">
							{ getDetails( threat ) }
						</span>
					</li>
				) ) }
			</ul>
			{ threats.summary.vulnerable > 0 && <p>{ vulnerableNote }</p> }
			{ showRestoreLink && (
				<RestoreThatOneInsteadLink
					siteId={ siteId }
					siteSlug={ siteSlug }
					restoreLinkTo={ restoreLinkTo }
					latestWithoutKnownThreats={ latestWithoutKnownThreats }
					currentBackupPeriod={ currentBackupPeriod }
				/>
			) }
		</div>
	);
}
