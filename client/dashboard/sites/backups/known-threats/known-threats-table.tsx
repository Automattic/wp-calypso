import { getBackupPeriod } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import { useIntlLocale } from '../../../app/locale';
import { siteBackupRestoreRoute, siteRoute } from '../../../app/router/sites';
import RouterLinkButton from '../../../components/router-link-button';
import type { BackupThreat, BackupThreats } from '@automattic/api-core';

interface KnownThreatsTableProps {
	threats: BackupThreats;
	latestWithoutKnownThreats?: number | null;
	currentRewindId?: string;
}

export function KnownThreatsTable( {
	threats,
	latestWithoutKnownThreats,
	currentRewindId,
}: KnownThreatsTableProps ) {
	const locale = useIntlLocale();
	const { siteSlug } = siteRoute.useParams();
	const rows = threats.threats.filter( ( threat ) => threat.kind !== 'vulnerable' );

	const formatDate = ( value: string | null ) =>
		value ? new Date( value ).toLocaleDateString( locale, { dateStyle: 'medium' } ) : '';

	const getWhere = ( threat: BackupThreat ) =>
		threat.slug ? `${ threat.slug }@${ threat.version ?? '' }` : threat.target;

	const getStatus = ( threat: BackupThreat ) => {
		if ( threat.state === 'fixed' ) {
			/* translators: %s is a localised date */
			return sprintf( __( 'Fixed %s' ), formatDate( threat.fixed_on ) );
		}
		return threat.status === 'ignored' ? __( 'Ignored' ) : __( 'Open' );
	};

	const vulnerableNote = sprintf(
		// translators: %d is the number of vulnerable plugin or theme versions
		__( 'Also: %d vulnerable plugin or theme versions.' ),
		threats.summary.vulnerable
	);

	const showAlternative =
		latestWithoutKnownThreats !== null &&
		latestWithoutKnownThreats !== undefined &&
		( currentRewindId === undefined ||
			getBackupPeriod( currentRewindId ) !== latestWithoutKnownThreats );

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
							<td>{ formatDate( threat.reported_on ) }</td>
							<td>{ getStatus( threat ) }</td>
						</tr>
					) ) }
				</tbody>
			</table>
			{ threats.summary.vulnerable > 0 && <p>{ vulnerableNote }</p> }
			{ showAlternative && (
				<RouterLinkButton
					variant="link"
					to={ siteBackupRestoreRoute.fullPath }
					params={ { siteSlug, rewindId: String( latestWithoutKnownThreats ) } }
				>
					{ __( 'Restore that one instead' ) }
				</RouterLinkButton>
			) }
		</div>
	);
}
