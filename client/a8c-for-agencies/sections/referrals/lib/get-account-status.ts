export const getAccountStatus = (
	data: {
		status: string;
		isPayable: boolean;
		statusReason: string;
	} | null,
	translate: ( key: string ) => string
): {
	statusType: 'success' | 'warning' | 'error';
	status: string;
	statusReason?: string;
} | null => {
	if ( ! data ) {
		return null;
	}
	const { status, isPayable, statusReason } = data;
	switch ( status ) {
		case 'ACTIVE':
			if ( ! isPayable ) {
				return {
					statusType: 'warning',
					status: translate( 'Not Payable' ),
					statusReason,
				};
			}
			return {
				statusType: 'success',
				status: translate( 'Confirmed' ),
			};
		case 'SUSPENDED':
			return {
				statusType: 'error',
				status: translate( 'Suspended' ),
			};
		case 'BLOCKED_BY_TIPALTI':
		case 'BLOCKED':
			return {
				statusType: 'error',
				status: translate( 'Blocked' ),
			};
		default:
			return null;
	}
};
