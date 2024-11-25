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

declare module 'calypso/blocks/inline-help/inline-help-search-results' {
	const InlineHelpSearchResults: FC;
	export = InlineHelpSearchResults;
}
declare module 'calypso/components/embed-container' {
	const EmbedContainer: FC;
	export default EmbedContainer;
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
	export const isJetpackSite: ( state: unknown, siteId: number ) => boolean | null;
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

declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUserId: ( state: unknown ) => string;
}

declare module 'calypso/state/current-user/selectors' {
	export const getCurrentUser: ( state: unknown ) => { display_name: string };
}

declare module 'calypso/components/ellipsis-menu' {
	const EllipsisMenu: FC< {
		popoverClassName?: string;
		position?: string;
		children: React.ReactNode;
	} >;

	export default EllipsisMenu;
}

declare module 'calypso/components/popover-menu/item' {
	const PopoverMenuItem: FC< {
		className?: string;
		onClick: ( event: React.MouseEvent< HTMLButtonElement > ) => void;
		children: React.ReactNode;
	} >;

	export default PopoverMenuItem;
}

declare module 'calypso/components/popover-menu' {
	const EllipsisMenu: FC< {
		popoverClassName?: string;
		position?: string;
		children: React.ReactNode;
	} >;

	export default EllipsisMenu;
}

declare module 'calypso/components/gravatar' {
	const Gravatar: FC< {
		user?: { display_name: string };
		size?: number;
		alt?: string;
	} >;

	export default Gravatar;
}

declare module 'calypso/components/section-nav' {
	const SectionNav: FC< {
		children: React.ReactNode;
	} >;
	export default SectionNav;
}

declare module 'calypso/components/section-nav/tabs' {
	const SectionNavTabs: FC< {
		children: React.ReactNode;
	} >;
	export default SectionNavTabs;
}

declare module 'calypso/components/section-nav/item' {
	const SectionNavItem: FC< {
		selected: boolean;
		onClick: () => void;
		count?: number;
		children: React.ReactNode;
	} >;
	export default SectionNavItem;
}

declare module 'calypso/components/textarea-autosize' {
	const TextareaAutosize: FC< {
		placeholder: string;
		className: string;
		rows: number;
		value: string;
		onChange: ( event: React.ChangeEvent< HTMLTextAreaElement > ) => void;
		onKeyPress: ( event: KeyboardEvent< HTMLTextAreaElement > ) => Promise< void >;
	} >;

	export default TextareaAutosize;
}

declare module 'calypso/state/selectors/get-admin-help-results' {
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

declare module '*.svg' {
	const content: string;
	export default content;
}
