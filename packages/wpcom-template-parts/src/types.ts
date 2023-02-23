export interface HeaderProps {
	isLoggedIn: boolean;
	sectionName?: string;
}

export interface FooterProps {
	onLanguageChange: React.ChangeEventHandler< HTMLSelectElement >;
	isLoggedIn: boolean;
	currentRoute: string;
	additonalCompanyLinks?: HTMLLIElement;
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
