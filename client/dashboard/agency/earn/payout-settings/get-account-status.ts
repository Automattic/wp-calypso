import { __ } from '@wordpress/i18n';
import type { TipaltiPayee } from '@automattic/api-core';

interface AccountStatus {
	statusType: 'success' | 'warning' | 'error';
	status: string;
	statusReason?: string;
	actionRequired: boolean;
}

export function getAccountStatus( data: TipaltiPayee | null | undefined ): AccountStatus | null {
	if ( ! data ) {
		return null;
	}
	const { Status, IsPayable, PayableReason } = data;
	let statusMeta = null;
	switch ( Status ) {
		case 'Active':
			if ( ! IsPayable ) {
				statusMeta = {
					statusType: 'warning',
					status: __( 'Not Payable' ),
					statusReason: PayableReason?.map( ( reason ) => {
						if ( reason === 'No PM' ) {
							return __( 'Bank details are missing' );
						}
						if ( reason === 'Tax' ) {
							return __( 'Tax form is missing' );
						}
						return reason;
					} ).join( ', ' ),
				};
				break;
			}
			statusMeta = {
				statusType: 'success',
				status: __( 'Confirmed' ),
			};
			break;
		case 'Suspended':
			statusMeta = {
				statusType: 'error',
				status: __( 'Suspended' ),
			};
			break;
		case 'Blocked':
			statusMeta = {
				statusType: 'error',
				status: __( 'Blocked' ),
				statusReason: __( 'Your account is blocked' ),
			};
			break;
		case 'Closed':
			statusMeta = {
				statusType: 'error',
				status: __( 'Closed' ),
				statusReason: __( 'Your account is closed' ),
			};
			break;
		default:
			break;
	}

	if ( ! statusMeta ) {
		return null;
	}

	return {
		...statusMeta,
		actionRequired: [ 'warning', 'error' ].includes( statusMeta.statusType ),
	} as AccountStatus;
}
