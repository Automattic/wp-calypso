const useQueryKeysFactory = () => ( {
	site: ( siteIdOrSlug?: string | number | null ) => [ 'site', siteIdOrSlug ],
	siteFeatures: ( siteIdOrSlug?: string | number | null ) => [ 'site-features', siteIdOrSlug ],
	siteMediaStorage: ( siteIdOrSlug?: string | number | null ) => [
		'site-media-storage',
		siteIdOrSlug,
	],
	siteUser: ( siteId: number | null | undefined, userId: number | null | undefined ) => [
		'site-user',
		siteId,
		userId,
	],
} );

export default useQueryKeysFactory;
