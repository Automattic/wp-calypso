const useQueryKeysFactory = () => ( {
	// TODO: Verify that this is the correct convention for query keys
	sitePlans: ( coupon?: string, siteId?: string | number | null ) => [
		'site-plans',
		siteId,
		coupon,
	],
	plans: ( coupon?: string ) => [ 'plans', coupon ],
} );

export default useQueryKeysFactory;
