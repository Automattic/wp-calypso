interface StatusMeta {
	statusType: 'success' | 'warning' | 'error';
	status: string;
	statusReason?: string;
	actionRequired: boolean;
}

export const getAccountStatus = (
	data: {
		Status: string;
		IsPayable: boolean;
		PayableReason: string[];
	} | null,
	translate: ( key: string ) => string
): StatusMeta | null => {
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
				break;
			}
			statusMeta = {
				statusType: 'success',
				status: translate( 'Confirmed' ),
			};
			break;
		case 'Suspended':
			statusMeta = {
				statusType: 'error',
				status: translate( 'Suspended' ),
			};
			break;
		case 'Blocked':
			statusMeta = {
				statusType: 'error',
				status: translate( 'Blocked' ),
				statusReason: translate( 'Your account is blocked' ),
			};
			break;
		case 'Closed':
			statusMeta = {
				statusType: 'error',
				status: translate( 'Closed' ),
				statusReason: translate( 'Your account is closed' ),
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
		actionRequired: [ 'warning', 'error' ].includes( statusMeta?.statusType ),
	} as StatusMeta;
};
