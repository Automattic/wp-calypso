import { DomainData } from '@automattic/data-stores';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface DomainsTableSslCellProps {
	domainManagementLink: string;
	sslStatus: DomainData[ 'ssl_status' ];
	hasWpcomManagedSslCert: boolean;
}

export default function DomainsTableSslCell( {
	domainManagementLink,
	sslStatus,
	hasWpcomManagedSslCert,
}: DomainsTableSslCellProps ) {
	const translate = useTranslate();
	// WordPress.com managed subdomains (e.g. *.wordpress.com, *.wpcomstaging.com, etc.)
	// are covered by a wildcard SSL cert, so we display them as 'Active'.
	const isActiveSsl = sslStatus === 'active' || hasWpcomManagedSslCert;
	const isPendingSsl = sslStatus === 'pending' || sslStatus === 'newly_registered';
	const domainHasSsl = sslStatus !== null || hasWpcomManagedSslCert;

	const getSslStatusText = () => {
		if ( isActiveSsl ) {
			return translate( 'Active' );
		}
		if ( isPendingSsl ) {
			return translate( 'Pending' );
		}
		if ( sslStatus === 'disabled' ) {
			return translate( 'Disabled' );
		}
	};

	let button: React.ReactElement | string;

	if ( sslStatus ) {
		button = (
			<a
				className="domains-table-row__ssl-status-button"
				href={ `${ domainManagementLink }?ssl-open=true` }
				onClick={ ( event ) => event.stopPropagation() }
			>
				{ getSslStatusText() }
			</a>
		);
	} else if ( hasWpcomManagedSslCert ) {
		button = <span>{ translate( 'Active' ) }</span>;
	} else {
		button = '-';
	}

	return (
		<td
			className={ clsx( `domains-table-row__ssl-cell`, {
				[ `domains-table-row__ssl-cell__active` ]: isActiveSsl,
				[ `domains-table-row__ssl-cell__pending` ]: isPendingSsl,
				[ `domains-table-row__ssl-cell__disabled` ]: sslStatus === 'disabled',
			} ) }
		>
			{ domainHasSsl && <Icon icon={ lock } size={ 18 } /> }
			{ button }
		</td>
	);
}
