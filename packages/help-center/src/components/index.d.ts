declare module 'calypso/blocks/support-article-dialog/dialog-content' {
	const ArticleContent: FC< { postId: number; blogId: number | null; articleUrl: string | null } >;
	export = ArticleContent;
}
declare module 'calypso/components/search-card' {
	const SearchCard: FC;
	export = SearchCard;
}
declare module 'calypso/blocks/inline-help/inline-help-search-card' {
	const InlineHelpSearchCard: FC;
	export = InlineHelpSearchCard;
}

declare module 'calypso/blocks/inline-help/inline-help-search-results' {
	const InlineHelpSearchResults: FC;
	export = InlineHelpSearchResults;
}

declare module 'calypso/components/data/query-user-purchases' {
	const QueryUserPurchases: () => null;
	export const purchases: void;
	export = QueryUserPurchases;
}
declare module 'calypso/state/purchases/selectors' {
	export const getUserPurchases: ( state: unknown ) => { productSlug: string }[];
}

declare module 'calypso/state/ui/selectors' {
	export const getSelectedSiteId: ( state: unknown ) => number;
	export const getSectionName: ( state: unknown ) => string;
}

declare module 'calypso/state/sites/selectors' {
	export const getSite: ( state: unknown, siteId: number ) => { is_wpcom_atomic: boolean };
	export const getIsSimpleSite: ( state: unknown ) => boolean;
}

declare module 'calypso/state/sites/selectors/is-simple-site' {
	const getIsSimpleSite: ( state: unknown, siteId?: number ) => boolean;
	export default getIsSimpleSite;
}

declare module 'calypso/state/sites/selectors/is-jetpack-site' {
	const isJetpackSite: ( state: unknown, siteId?: number ) => boolean;
	export default isJetpackSite;
}

declare module 'calypso/state/sites/hooks' {
	export const useSiteOption: ( state: unknown ) => string;
}

declare module 'calypso/state/selectors/has-cancelable-user-purchases' {
	const hasCancelableUserPurchases: ( state: unknown ) => boolean;
	export default hasCancelableUserPurchases;
}

declare module 'calypso/state/inline-help/selectors/get-admin-help-results' {
	const getAdminHelpResults: ( state: unknown ) => unknown[];
	export default getAdminHelpResults;
}

declare module '@automattic/state-utils' {
	export const createSelector = unknown;
}
