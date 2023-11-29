const useQueryKeysFactory = () => ( {
	sitePlans: ( siteId?: string | number | null ) => [ 'site-plans', siteId ],
	plans: () => [ 'plans' ],
} );

export default useQueryKeysFactory;
