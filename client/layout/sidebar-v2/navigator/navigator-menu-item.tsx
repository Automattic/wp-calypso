import {
	__experimentalNavigatorButton as NavigatorButton,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
	FlexBlock,
} from '@wordpress/components';
import { Icon, chevronRightSmall, external } from '@wordpress/icons';
import classnames from 'classnames';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	icon: JSX.Element;
	path: string;
	link: string;
	title: string;
	onClickMenuItem: ( path: string ) => void;
	withChevron?: boolean;
	isExternalLink?: boolean;
}

export const SidebarNavigatorMenuItem = ( {
	icon,
	path,
	link,
	title,
	onClickMenuItem,
	withChevron,
	isExternalLink,
}: Props ) => {
	const pathname = window.location.pathname;

	const SidebarItem = ( { children }: { children?: JSX.Element } ) => {
		return (
			<Item
				className={ classnames( 'sidebar-v2__menu-item', {
					'is-active': pathname === link,
				} ) }
				onClick={ () => onClickMenuItem( link ) }
			>
				<HStack justify="flex-start">
					{ icon && <Icon style={ { fill: 'currentcolor' } } icon={ icon } size={ ICON_SIZE } /> }
					<FlexBlock>{ children }</FlexBlock>
					{ withChevron && <Icon icon={ chevronRightSmall } size={ ICON_SIZE } /> }
					{ isExternalLink && (
						<Icon className="sidebar-v2__external-icon" icon={ external } size={ ICON_SIZE } />
					) }
				</HStack>
			</Item>
		);
	};

	return (
		<NavigatorButton as={ SidebarItem } path={ path }>
			{ title }
		</NavigatorButton>
	);
};
