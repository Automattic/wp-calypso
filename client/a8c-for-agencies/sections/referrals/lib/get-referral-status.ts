import type { BadgeType } from '@automattic/components';

export function getReferralStatus(
	status: string,
	translate: ( key: string ) => string
): {
	status: string | null;
	type: BadgeType;
} {
	switch ( status ) {
		case 'active':
			return {
				status: translate( 'Active' ),
				type: 'success',
			};
		case 'pending':
			return {
				status: translate( 'Pending' ),
				type: 'warning',
			};
		case 'canceled':
			return {
				status: translate( 'Canceled' ),
				type: 'info',
			};
		case 'error':
			return {
				status: translate( 'Error' ),
				type: 'error',
			};
		case 'archived':
			return {
				status: translate( 'Archived' ),
				type: 'info',
			};
		default:
			return {
				status: translate( 'Mixed' ),
				type: 'warning',
			};
	}
}
