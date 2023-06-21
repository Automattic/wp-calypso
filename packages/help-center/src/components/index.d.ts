declare module 'calypso/blocks/support-article-dialog/header' {
	const SupportArticleHeader: FC< {
		postId: number;
		blogId: number | null;
		articleUrl: string | null;
	} >;
	export default ArticleContent;
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

declare module 'calypso/components/data/query-reader-post' {
	const QueryReaderPost: FC;
	export default QueryReaderPost;
}

declare module 'calypso/components/data/query-reader-site' {
	const QueryReaderSite: FC;
	export default QueryReaderSite;
}

declare module 'calypso/components/embed-container' {
	const EmbedContainer: FC;
	export default EmbedContainer;
}

declare module 'calypso/data/support-article-alternates/use-support-article-alternates-query' {
	const useSupportArticleAlternatesQuery: (
		blogId: number,
		postId: number
	) => { isInitialLoading: boolean; data?: { blog_id: number; page_id: number } };
	export default useSupportArticleAlternatesQuery;
}

declare module 'calypso/state/data-layer/wpcom-api-middleware' {
	const WpcomApiMiddleware = ( Function ) => Function;
	export const WpcomApiMiddleware;
}

declare module 'calypso/state/reader/posts/selectors' {
	export const getPostByKey;
}

declare module 'calypso/state/purchases/selectors' {
	export const getUserPurchases: ( state: unknown ) => { productSlug: string }[];
}

declare module 'calypso/state/ui/selectors' {
	export const getSelectedSiteId: ( state: unknown ) => number;
	export const getSectionName: ( state: unknown ) => SectionName;
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

declare module 'calypso/state/selectors/get-primary-site-id' {
	const getPrimarySiteId: ( state: unknown ) => number;
	export default getPrimarySiteId;
}

declare module 'calypso/state/selectors/has-cancelable-user-purchases' {
	const hasCancelableUserPurchases: ( state: unknown ) => boolean;
	export default hasCancelableUserPurchases;
}

declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUserEmail: ( state: unknown ) => string;
}
declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUserId: ( state: unknown ) => string;
}

declare module 'calypso/state/inline-help/selectors/get-admin-help-results' {
	const getAdminHelpResults: (
		state: unknown,
		searchQuery: string,
		limit: number
	) => {
		title: string;
		description: string;
		link: string;
		synonyms: string[];
		icon: string;
	}[];
	export default getAdminHelpResults;
}

declare module 'calypso/lib/formatting' {
	export const decodeEntities: ( text: string ) => string;
	export const preventWidows: ( text: string, wordsToKeep?: number ) => string;
}

declare module 'calypso/state/analytics/actions' {
	export const recordTracksEvent: (
		name: string,
		properties: unknown
	) => {
		type: string;
		meta: {
			analytics: {
				type: string;
				payload: unknown;
			}[];
		};
	};
}

declare module 'calypso/lib/mobile-app';
