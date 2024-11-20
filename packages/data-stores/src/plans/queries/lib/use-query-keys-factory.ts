const useQueryKeysFactory = () => ( {
	sitePlans: ( coupon?: string, siteId?: string | number | null ) => [
		'site-plans',
		siteId,
		coupon,
	],
	plans: ( coupon?: string ) => [ 'plans', coupon ],
} );

export default useQueryKeysFactory;
