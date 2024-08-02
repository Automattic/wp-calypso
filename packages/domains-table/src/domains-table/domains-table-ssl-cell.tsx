import { Icon } from '@wordpress/components';
import { lock } from '@wordpress/icons';
import clsx from 'clsx';

interface DomainsTableSSLCellProps {
	sslStatus: 'active' | 'pending' | 'disabled' | null;
}

export default function DomainsTableSSLCell( { sslStatus }: DomainsTableSSLCellProps ) {
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
			{ sslStatus === null ? '-' : sslStatus.charAt( 0 ).toUpperCase() + sslStatus.slice( 1 ) }
		</div>
	);
}
