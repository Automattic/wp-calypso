const useQueryKeysFactory = () => ( {
	sitePurchases: ( siteId?: string | number | null ) => [ 'site-purchases', siteId ],
	transferredPurchases: ( userId?: string | number | null ) => [ 'transferred-purchases', userId ],
} );

export default useQueryKeysFactory;
