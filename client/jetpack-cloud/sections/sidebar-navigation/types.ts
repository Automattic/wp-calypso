export type MenuItemProps = {
	id?: string;
	icon: JSX.Element;
	link: string;
	path: string;
	title: string;
	withChevron?: boolean;
	isExternalLink?: boolean;
	trackEventProps?: { [ key: string ]: string };
};
