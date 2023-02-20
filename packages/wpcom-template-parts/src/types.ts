export interface HeaderProps {
	isLoggedIn: boolean;
	sectionName: string;
}

export interface FooterProps {
	isLoggedIn: boolean;
	currentRoute: string;
	additonalFooterLinks: any;
}

export interface MenuItemProps {
	content: string;
	className?: string;
}

export interface ClickableItemProps extends MenuItemProps {
	titleValue: string;
	urlValue: string;
	type: string;
	typeClassName?: string;
	target?: string;
}
