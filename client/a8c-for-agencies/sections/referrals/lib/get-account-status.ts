export const getAccountStatus = (
	data: {
		Status: string;
		IsPayable: boolean;
		PayableReason: string[];
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
	const { Status, IsPayable, PayableReason } = data;
	switch ( Status ) {
		case 'Active':
			if ( ! IsPayable ) {
				return {
					statusType: 'warning',
					status: translate( 'Not Payable' ),
					statusReason: PayableReason?.map( ( reason ) => {
						if ( reason === 'No PM' ) {
							return translate( 'Bank details are missing' );
						}
						if ( reason === 'Tax' ) {
							return translate( 'Tax form is missing' );
						}
						return reason;
					} ).join( ', ' ),
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
