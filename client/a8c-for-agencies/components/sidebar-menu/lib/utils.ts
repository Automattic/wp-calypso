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
	trackEventProps?: { [ key: string ]: string };
};

export const createItem = ( props: MenuItemProps, path: string ) => ( {
	...props,
	trackEventName: 'calypso_a4a_sidebar_menu_click',
	isSelected: props.link.startsWith( A4A_SITES_LINK )
		? props.link === path
		: itemLinkMatches( props.link, path ),
} );
