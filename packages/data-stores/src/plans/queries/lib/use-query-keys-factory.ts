const useQueryKeysFactory = () => ( {
	sitePlans: ( siteId?: string | number | null ) => [ 'site-plans', siteId ],
	plans: ( coupon?: string ) => [ 'plans', coupon ],
} );

export default useQueryKeysFactory;
