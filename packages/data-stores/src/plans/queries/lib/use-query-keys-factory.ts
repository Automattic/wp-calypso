const useQueryKeysFactory = () => ( {
	sitePlans: ( siteId?: string | number | null ) => [ 'site-plans', siteId ],
} );

export default useQueryKeysFactory;
