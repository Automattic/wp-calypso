import { DomainData } from '@automattic/data-stores';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface DomainsTableSslCellProps {
	domainManagementLink: string;
	sslStatus: DomainData[ 'ssl_status' ];
	hasWpcomManagedSslCert?: DomainData[ 'has_wpcom_managed_ssl_cert' ];
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

	const getSslStatusClassnames = ( element: 'button' | 'icon' ) =>
		clsx( `domains-table-row__ssl-status-${ element }`, {
			[ `domains-table-row__ssl-status-${ element }__active` ]: isActiveSsl,
			[ `domains-table-row__ssl-status-${ element }__pending` ]: isPendingSsl,
			[ `domains-table-row__ssl-status-${ element }__disabled` ]: sslStatus === 'disabled',
		} );

	let button: React.ReactElement | string;

	if ( sslStatus ) {
		button = (
			<a
				className={ getSslStatusClassnames( 'button' ) }
				href={ `${ domainManagementLink }?ssl-open=true` }
				onClick={ ( event ) => event.stopPropagation() }
			>
				{ getSslStatusText() }
			</a>
		);
	} else if ( hasWpcomManagedSslCert ) {
		button = <span className={ getSslStatusClassnames( 'button' ) }>{ getSslStatusText() }</span>;
	} else {
		button = '-';
	}

	return (
		<td className="domains-table-row__ssl-cell">
			{ domainHasSsl && (
				<Icon className={ getSslStatusClassnames( 'icon' ) } icon={ lock } size={ 18 } />
			) }
			{ button }
		</td>
	);
}
