import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

interface DomainsTableSSLCellProps {
	sslStatus: 'active' | 'pending' | 'disabled' | null;
}

export default function DomainsTableSSLCell( { sslStatus }: DomainsTableSSLCellProps ) {
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
		return '-';
	};

	return (
		<div
			className={ clsx( 'domains-table-row__ssl-cell', {
				[ 'domains-table-row__ssl-cell__active' ]: sslStatus === 'active',
				[ 'domains-table-row__ssl-cell__pending' ]: sslStatus === 'pending',
				[ 'domains-table-row__ssl-cell__disabled' ]: sslStatus === 'disabled',
			} ) }
		>
			{ sslStatus && (
				<Icon
					className={ clsx( 'domains-table-row__ssl-icon', {
						[ 'domains-table-row__ssl-icon__active' ]: sslStatus === 'active',
						[ 'domains-table-row__ssl-icon__pending' ]: sslStatus === 'pending',
						[ 'domains-table-row__ssl-icon__disabled' ]: sslStatus === 'disabled',
					} ) }
					icon={ lock }
				/>
			) }
			{ getSSLStatusText() }
		</div>
	);
}
