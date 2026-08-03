const useQueryKeysFactory = () => ( {
	// The `2` is a cache version. #112677 changed the stored shape from the assembled
	// camelCase `Purchase` to the raw snake_case `RawPurchase` under this same key, so
	// long-lived sessions spanning that deploy served stale assembled data to new readers.
	// Bump this whenever the stored shape changes so old and new code never share an entry.
	sitePurchases: ( siteId?: string | number | null ) => [ 'site-purchases', 2, siteId ],
	transferredPurchases: ( userId?: string | number | null ) => [ 'transferred-purchases', userId ],
} );

export default useQueryKeysFactory;
