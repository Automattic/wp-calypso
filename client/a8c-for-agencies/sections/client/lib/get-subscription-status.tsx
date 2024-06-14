export const getSubscriptionStatus = (
	status: string,
	translate: ( key: string ) => string
): {
	children: string | undefined;
	type: 'success' | 'warning' | undefined;
} => {
	switch ( status ) {
		case 'active':
			return {
				children: translate( 'Active' ),
				type: 'success',
			};
		case 'pending':
			return {
				children: translate( 'Pending' ),
				type: 'warning',
			};
		case 'overdue':
			return {
				children: translate( 'Overdue' ),
				type: 'warning',
			};
		default:
			return {
				children: undefined,
				type: undefined,
			};
	}
};
