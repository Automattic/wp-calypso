import { __ } from '@wordpress/i18n';

export type ReferralStatusBadgeIntent = 'draft' | 'informational' | 'stable' | 'medium' | 'high';

export function getReferralStatus( status: string ): {
	status: string;
	type: ReferralStatusBadgeIntent;
} {
	switch ( status ) {
		case 'active':
			return {
				status: __( 'Active' ),
				type: 'stable',
			};
		case 'pending':
			return {
				status: __( 'Pending' ),
				type: 'medium',
			};
		case 'canceled':
			return {
				status: __( 'Canceled' ),
				type: 'informational',
			};
		case 'error':
			return {
				status: __( 'Error' ),
				type: 'high',
			};
		case 'archived':
			return {
				status: __( 'Archived' ),
				type: 'draft',
			};
		default:
			return {
				status: __( 'Mixed' ),
				type: 'medium',
			};
	}
}
