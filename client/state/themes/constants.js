export const DEFAULT_THEME_QUERY = {
	search: '',
	tier: '',
	filter: '',
	number: 20,
	offset: 0,
	page: 1,
};

// Some free themes are available in both wpcom and wporg. However, the themes endpoint won't return
// the retired themes on wpcom so we're not able to filter them out from the search result. The
// number of this kind of theme is not too many, so hard-code the list here to hide those themes
// instead of querying them one by one when showing the search result.
// See https://github.com/Automattic/wp-calypso/issues/77991
export const RETIRED_THEME_SLUGS_SET = new Set( [ 'blank-canvas' ] );
