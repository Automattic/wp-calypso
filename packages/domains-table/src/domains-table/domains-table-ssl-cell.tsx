import { DomainData } from '@automattic/data-stores';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface DomainsTableSSLCellProps {
	domainManagementLink: string;
	sslStatus: DomainData[ 'ssl_status' ];
	hasWpcomManagedSslCert?: DomainData[ 'has_wpcom_managed_ssl_cert' ];
}

export default function DomainsTableSSLCell( {
	domainManagementLink,
	sslStatus,
	hasWpcomManagedSslCert,
}: DomainsTableSSLCellProps ) {
	const translate = useTranslate();
	// WordPress.com managed subdomains (e.g. *.wordpress.com, *.wpcomstaging.com, etc.)
	// are covered by a wildcard SSL cert, so we display them as 'Active'.
	const isActiveSSL = sslStatus === 'active' || hasWpcomManagedSslCert;
	const isPendingSSL = sslStatus === 'pending' || sslStatus === 'newly_registered';
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

	const getSSLStatusText = () => {
		if ( isActiveSSL ) {
			return translate( 'Active' );
		}
		if ( isPendingSSL ) {
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
						[ 'domains-table-row__ssl-icon__active' ]: isActiveSSL,
						[ 'domains-table-row__ssl-icon__pending' ]: isPendingSSL,
						[ 'domains-table-row__ssl-icon__disabled' ]: sslStatus === 'disabled',
					} ) }
					icon={ lock }
					size={ 18 }
				/>
			) }
			<Element
				className={ clsx( 'domains-table-row__ssl-status-button', {
					[ 'domains-table-row__ssl-status-button__active' ]: isActiveSSL,
					[ 'domains-table-row__ssl-status-button__pending' ]: isPendingSSL,
					[ 'domains-table-row__ssl-status-button__disabled' ]: sslStatus === 'disabled',
				} ) }
			>
				{ 	const getSSLStatusText = () => {
() }
			</Element>
		</td>
	);
}
