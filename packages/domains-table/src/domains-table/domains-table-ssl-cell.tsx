import { DomainData } from '@automattic/data-stores';
import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface DomainsTableSSLCellProps {
	domainManagementLink: string;
	sslStatus: DomainData[ 'ssl_status' ];
}

export default function DomainsTableSSLCell( {
	domainManagementLink,
	sslStatus,
}: DomainsTableSSLCellProps ) {
	const translate = useTranslate();

	const getSSLStatusText = () => {
		if ( sslStatus === 'active' ) {
			return translate( 'Active' );
		}
		if ( sslStatus === 'pending' ) {
			return translate( 'Pending' );
		}
		if ( sslStatus === 'disabled' ) {
			return translate( 'Disabled' );
		}
	};

	return (
		<td className="domains-table-row__ssl-cell">
			{ sslStatus && (
				<Icon
					className={ clsx( 'domains-table-row__ssl-icon', {
						[ 'domains-table-row__ssl-icon__active' ]: sslStatus === 'active',
						[ 'domains-table-row__ssl-icon__pending' ]: sslStatus === 'pending',
						[ 'domains-table-row__ssl-icon__disabled' ]: sslStatus === 'disabled',
					} ) }
					icon={ lock }
					size={ 18 }
				/>
			) }
			{ sslStatus !== null ? (
				<a
					className={ clsx( 'domains-table-row__ssl-status-button', {
						[ 'domains-table-row__ssl-status-button__active' ]: sslStatus === 'active',
						[ 'domains-table-row__ssl-status-button__pending' ]: sslStatus === 'pending',
						[ 'domains-table-row__ssl-status-button__disabled' ]: sslStatus === 'disabled',
					} ) }
					href={ `${ domainManagementLink }?ssl-open=true` }
					onClick={ ( event ) => event.stopPropagation() }
				>
					{ getSSLStatusText() }
				</a>
			) : (
				<>-</>
			) }
		</td>
	);
}
