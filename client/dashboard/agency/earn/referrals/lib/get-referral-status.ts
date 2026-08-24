import { __ } from '@wordpress/i18n';

export type ReferralStatusBadgeIntent = 'default' | 'info' | 'success' | 'warning' | 'error';

export function getReferralStatus( status: string ): {
	status: string;
	type: ReferralStatusBadgeIntent;
} {
	switch ( status ) {
		case 'active':
			return {
				status: __( 'Active' ),
				type: 'success',
			};
		case 'pending':
			return {
				status: __( 'Pending' ),
				type: 'warning',
			};
		case 'canceled':
			return {
				status: __( 'Canceled' ),
				type: 'info',
			};
		case 'error':
			return {
				status: __( 'Error' ),
				type: 'error',
			};
		case 'archived':
			return {
				status: __( 'Archived' ),
				type: 'default',
			};
		default:
			return {
				status: __( 'Mixed' ),
				type: 'warning',
			};
	}
}
