const useQueryKeysFactory = () => ( {
	site: ( siteIdOrSlug?: string | number | null ) => [ 'site', siteIdOrSlug ],
	siteFeatures: ( siteIdOrSlug?: string | number | null ) => [ 'site-features', siteIdOrSlug ],
	siteMediaStorage: ( siteIdOrSlug?: string | number | null ) => [
		'site-media-storage',
		siteIdOrSlug,
	],
} );

export default useQueryKeysFactory;
