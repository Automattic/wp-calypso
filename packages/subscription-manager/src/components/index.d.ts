declare module 'calypso/components/section-nav' {
	const SectionNav: FC< {
		selectedText: React.ReactNode;
		selectedCount: number;
		hasPinnedItems: boolean;
		onMobileNavPanelOpen: () => void;
		className: string;
		allowDropdown: boolean;
	} >;
	export default SectionNav;
}

declare module 'calypso/components/section-nav/tabs' {
	const NavTabs: FC< {
		selectedText: TranslatableString;
		selectedCount: number;
		label: string;
		hasSiblingControls: boolean;
	} >;
	export default NavTabs;
}

declare module 'calypso/components/section-nav/item' {
	const NavItem: FC< {
		itemType: string;
		path: string;
		selected: boolean;
		tabIndex: number;
		onClick: () => void;
		onKeyPress: () => void;
		isExternalLink: boolean;
		disabled: boolean;
		count: number | boolean;
		compactCount: boolean;
		className: string;
		preloadSectionName: string;
	} >;
	export default NavItem;
}
