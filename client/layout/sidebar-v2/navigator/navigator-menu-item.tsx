import { Badge } from '@automattic/components';
import {
	__experimentalNavigatorButton as NavigatorButton,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
	FlexBlock,
} from '@wordpress/components';
import { Icon, chevronRightSmall, external } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	id?: string;
	icon: React.JSX.Element;
	path: string;
	link: string;
	title: TranslateResult;
	badge?: string;
	onClickMenuItem: ( path: string ) => void;
	withChevron?: boolean;
	isExternalLink?: boolean;
	isSelected?: boolean;
	openInSameTab?: boolean;
	extraContent?: React.JSX.Element;
}

export const SidebarNavigatorMenuItem = ( {
	id,
	icon,
	path,
	link,
	title,
	badge,
	onClickMenuItem,
	withChevron = false,
	isExternalLink = false,
	isSelected = false,
	openInSameTab = false,
	extraContent,
}: Props ) => {
	const SidebarItem = ( { children }: { children?: React.JSX.Element } ) => {
		return (
			<Item
				className={ clsx( 'sidebar-v2__menu-item', {
					'is-active': isSelected,
				} ) }
				onClick={ () => onClickMenuItem( link ) }
				href={ link }
				id={ id }
				as="a"
				target={ isExternalLink && ! openInSameTab ? '_blank' : undefined }
			>
				<HStack justify="flex-start">
					{ icon && (
						<Icon
							className="sidebar__menu-icon"
							style={ { fill: 'currentcolor' } }
							icon={ icon }
							size={ ICON_SIZE }
						/>
					) }
					<FlexBlock>{ children }</FlexBlock>
					{ withChevron && <Icon icon={ chevronRightSmall } size={ ICON_SIZE } /> }
					{ isExternalLink && (
						<Icon className="sidebar-v2__external-icon" icon={ external } size={ ICON_SIZE } />
					) }
					{ extraContent }
				</HStack>
			</Item>
		);
	};

	return (
		<li>
			<NavigatorButton as={ SidebarItem } path={ path }>
				<div className="sidebar-menu-item__title-with-badge">
					{ title } { badge && <Badge type="info">{ badge }</Badge> }
				</div>
			</NavigatorButton>
		</li>
	);
};
