export interface AddNewSiteContextInterface {
	visibleModalType: string;
	setVisibleModalType: ( value: string ) => void;
}

export interface AddNewSiteMenuItemsProps {
	setMenuVisible: ( isVisible: boolean ) => void;
}

export interface AddNewSiteContentProps {
	isMenuVisible: boolean;
	popoverMenuContext: React.RefObject< HTMLButtonElement >;
	setMenuVisible: ( value: boolean ) => void;
	toggleMenu: () => void;
}
