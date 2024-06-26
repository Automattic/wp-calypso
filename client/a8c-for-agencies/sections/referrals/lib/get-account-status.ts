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
		case 'Suspended':
			return {
				statusType: 'error',
				status: translate( 'Suspended' ),
			};
		case 'Blocked':
			return {
				statusType: 'error',
				status: translate( 'Blocked' ),
				statusReason: translate( 'Your account is blocked' ),
			};
		case 'Closed':
			return {
				statusType: 'error',
				status: translate( 'Closed' ),
				statusReason: translate( 'Your account is closed' ),
			};
		default:
			return null;
	}
};
