export const getAccountStatus = (
	status: string,
	translate: ( key: string ) => string
): {
	statusType: 'success' | 'warning' | 'error';
	status: string;
} | null => {
	switch ( status ) {
		case 'ACTIVE':
			return {
				statusType: 'success',
				status: translate( 'Active' ),
			};

		case 'SUSPENDED':
			return {
				statusType: 'error',
				status: 'Suspended',
			};
		case 'BLOCKED_BY_TIPALTI':
		case 'BLOCKED':
			return {
				statusType: 'error',
				status: 'Blocked',
			};
		default:
			return null;
	}
};
