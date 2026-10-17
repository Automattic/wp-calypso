import { __, _n, sprintf } from '@wordpress/i18n';
import { useIntlLocale } from '../../../app/locale';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';
import { RestoreThatOneInsteadLink } from './restore-that-one-instead-link';
import './known-threats-table.scss';
import type { BackupThreat, BackupThreats } from '@automattic/api-core';

interface KnownThreatsTableProps {
	siteSlug: string;
	restoreLinkTo?: string;
	threats: BackupThreats;
	latestWithoutKnownThreats?: number | null;
	currentRewindId?: string;
}

export function KnownThreatsTable( {
	siteSlug,
	restoreLinkTo,
	threats,
	latestWithoutKnownThreats,
	currentRewindId,
}: KnownThreatsTableProps ) {
	const locale = useIntlLocale();
	const rows = threats.threats.filter( ( threat ) => threat.kind !== 'vulnerable' );

	const formatThreatDate = ( value: string | null ) =>
		value ? formatDate( parseDateAsUTC( value ), locale ) : '';

	const getWhere = ( threat: BackupThreat ) =>
		threat.slug ? `${ threat.slug }@${ threat.version ?? '' }` : threat.target;

	const getStatus = ( threat: BackupThreat ) => {
		if ( threat.state === 'fixed' ) {
			/* translators: %s is a localised date */
			return sprintf( __( 'Fixed %s' ), formatThreatDate( threat.fixed_on ) );
		}
		return threat.status === 'ignored' ? __( 'Ignored' ) : __( 'Open' );
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
		<div className="dashboard-backups__known-threats">
			<table className="dashboard-backups__known-threats-table">
				<thead>
					<tr>
						<th>{ __( 'Threat' ) }</th>
						<th>{ __( 'Where' ) }</th>
						<th>{ __( 'First detected' ) }</th>
						<th>{ __( 'Status now' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ rows.map( ( threat ) => (
						<tr key={ threat.id }>
							<td>{ threat.signature ?? threat.kind }</td>
							<td>{ getWhere( threat ) }</td>
							<td>{ formatThreatDate( threat.reported_on ) }</td>
							<td>{ getStatus( threat ) }</td>
						</tr>
					) ) }
				</tbody>
			</table>
			{ threats.summary.vulnerable > 0 && <p>{ vulnerableNote }</p> }
			<RestoreThatOneInsteadLink
				siteSlug={ siteSlug }
				restoreLinkTo={ restoreLinkTo }
				latestWithoutKnownThreats={ latestWithoutKnownThreats }
				currentRewindId={ currentRewindId }
			/>
		</div>
	);
}
