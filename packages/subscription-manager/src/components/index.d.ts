declare module 'calypso/components/data/document-head' {
	const DocumentHead: React.FC< {
		title?: string;
		skipTitleFormatting?: boolean;
		unreadCount?: number;
		link?: unknown[];
		meta?: unknown[];
		setTitle?: ( title: string ) => void;
		setLink?: ( link: unknown[] ) => void;
		setMeta?: ( meta: unknown[] ) => void;
		setUnreadCount?: ( unreadCount: number ) => void;
	} >;
	export default DocumentHead;
}

declare module 'calypso/components/formatted-header' {
	const FormattedHeader: React.FC< {
		id?: string;
		className?: string;
		brandFont?: boolean;
		headerText?: React.ReactNode;
		subHeaderText?: React.ReactNode;
		tooltipText?: React.ReactNode;
		compactOnMobile?: boolean;
		isSecondary?: boolean;
		align?: 'center' | 'left' | 'right';
		hasScreenOptions?: boolean;
		children?: React.ReactNode;
	} >;
	export default FormattedHeader;
}

declare module 'calypso/components/main' {
	const Main: React.FC< {
		className?: string;
		id?: string;
		children?: React.ReactNode;
		wideLayout?: boolean;
		fullWidthLayout?: boolean;
		isLoggedOut?: boolean;
	} >;
	export default Main;
}

declare module 'calypso/components/section-nav' {
	const SectionNav: React.FC< {
		selectedText?: string;
		selectedCount?: number;
		hasPinnedItems?: boolean;
		onMobileNavPanelOpen?: () => void;
		className?: string;
		allowDropdown?: boolean;
	} >;
	export default SectionNav;
}

declare module 'calypso/components/section-nav/tabs' {
	const NavTabs: React.FC< {
		selectedText?: TranslatableString;
		selectedCount?: number;
		label?: string;
		hasSiblingControls?: boolean;
	} >;
	export default NavTabs;
}

declare module 'calypso/components/section-nav/item' {
	const SectionNavItem: React.FC< {
		itemType?: 'button' | 'link';
		path?: string;
		selected?: boolean;
		tabIndex?: number;
		onClick?: ( event: React.MouseEvent< HTMLAnchorElement > ) => void;
		onKeyPress?: ( event: React.KeyboardEvent< HTMLAnchorElement > ) => void;
		isExternalLink?: boolean;
		disabled?: boolean;
		count?: number;
		compactCount?: boolean;
		className?: string;
		preloadSectionName?: string;
	} >;
	export default SectionNavItem;
}

declare module 'calypso/components/route' {
	export const useCurrentRoute: () => {
		currentSection: unkown;
		currentRoute: string;
		currentQuery: unkown;
	};
}
