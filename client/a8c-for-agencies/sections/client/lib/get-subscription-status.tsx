export const getSubscriptionStatus = (
	status: string,
	translate: ( key: string ) => string
): {
	children: string | undefined;
	type: 'draft' | 'stable' | 'medium' | 'informational' | 'high' | undefined;
} => {
	switch ( status ) {
		case 'pending':
			return {
				children: translate( 'Pending' ),
				type: 'medium',
			};
		case 'active':
			return {
				children: translate( 'Active' ),
				type: 'stable',
			};
		case 'error':
			return {
				children: translate( 'Error' ),
				type: 'high',
			};
		case 'canceled':
			return {
				children: translate( 'Canceled' ),
				type: 'draft',
			};
		default:
			return {
				children: undefined,
				type: undefined,
			};
	}
};
