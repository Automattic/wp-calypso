const useQueryKeysFactory = () => ( {
	site: ( siteIdOrSlug?: string | number | null ) => [ 'site', siteIdOrSlug ],
	siteFeatures: ( siteIdOrSlug?: string | number | null ) => [ 'site-features', siteIdOrSlug ],
} );

export default useQueryKeysFactory;
