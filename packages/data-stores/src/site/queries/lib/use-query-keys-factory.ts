const useQueryKeysFactory = () => ( {
	site: ( siteId?: string | number | null ) => [ 'site', siteId ],
} );

export default useQueryKeysFactory;
