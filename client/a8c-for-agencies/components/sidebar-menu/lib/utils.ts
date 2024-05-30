type MenuItemProps = {
	id?: string;
	icon: JSX.Element;
	link: string;
	path: string;
	title: string;
	withChevron?: boolean;
	isExternalLink?: boolean;
	isSelected?: boolean;
	trackEventProps?: { [ key: string ]: string };
	secondaryLinks?: string[];
};

export const createItem = ( props: MenuItemProps, path: string ) => {
	if ( typeof props.isSelected === 'undefined' ) {
		// If isSelected is not provided, determine it based on the path
		props.isSelected =
			props.link === path || ( props.secondaryLinks && props.secondaryLinks.includes( path ) );
	}

	return {
		...props,
		trackEventName: 'calypso_a4a_sidebar_menu_click',
	};
};
