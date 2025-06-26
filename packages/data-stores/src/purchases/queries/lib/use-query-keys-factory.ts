const useQueryKeysFactory = () => ( {
	sitePurchases: ( siteId?: string | number | null ) => [ 'site-purchases', siteId ],
} );

export default useQueryKeysFactory;
