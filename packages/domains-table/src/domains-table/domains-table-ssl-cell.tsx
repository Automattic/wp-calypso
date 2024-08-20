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
	const domainHasSsl = sslStatus || hasWpcomManagedSslCert;

	const Element = ( { children, ...props }: { children: React.ReactNode; className: string } ) => {
		if ( sslStatus ) {
			return (
				<a
					href={ `${ domainManagementLink }?ssl-open=true` }
					onClick={ ( event ) => event.stopPropagation() }
					{ ...props }
				>
					{ children }
				</a>
			);
		}

		if ( hasWpcomManagedSslCert ) {
			return <span { ...props }>{ children }</span>;
		}

		return '-';
	};

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

	return (
		<td className="domains-table-row__ssl-cell">
			{ domainHasSsl && (
				<Icon
					className={ clsx( 'domains-table-row__ssl-icon', {
						[ 'domains-table-row__ssl-icon__active' ]: isActiveSsl,
						[ 'domains-table-row__ssl-icon__pending' ]: isPendingSsl,
						[ 'domains-table-row__ssl-icon__disabled' ]: sslStatus === 'disabled',
					} ) }
					icon={ lock }
					size={ 18 }
				/>
			) }
			<Element
				className={ clsx( 'domains-table-row__ssl-status-button', {
					[ 'domains-table-row__ssl-status-button__active' ]: isActiveSsl,
					[ 'domains-table-row__ssl-status-button__pending' ]: isPendingSsl,
					[ 'domains-table-row__ssl-status-button__disabled' ]: sslStatus === 'disabled',
				} ) }
			>
				{ getSslStatusText() }
			</Element>
		</td>
	);
}
