import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { A4A_SITES_LINK } from './constants';

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
	extraContent?: JSX.Element;
};

export const createItem = ( props: MenuItemProps, path: string ) => {
	const linkMatches = props.link.startsWith( A4A_SITES_LINK )
		? props.link === path
		: itemLinkMatches( props.link, path );

	// Use props.isSelected if defined, otherwise fallback to the linkMatches condition
	const isSelected = typeof props.isSelected !== 'undefined' ? props.isSelected : linkMatches;

	return {
		...props,
		trackEventName: 'calypso_a4a_sidebar_menu_click',
		isSelected,
	};
};
