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
	icon: JSX.Element;
	path: string;
	link: string;
	title: TranslateResult;
	onClickMenuItem: ( path: string ) => void;
	withChevron?: boolean;
	isExternalLink?: boolean;
	isSelected?: boolean;
	openInSameTab?: boolean;
}

export const SidebarNavigatorMenuItem = ( {
	id,
	icon,
	path,
	link,
	title,
	onClickMenuItem,
	withChevron = false,
	isExternalLink = false,
	isSelected = false,
	openInSameTab = false,
}: Props ) => {
	const SidebarItem = ( { children }: { children?: JSX.Element } ) => {
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
				</HStack>
			</Item>
		);
	};

	return (
		<li>
			<NavigatorButton as={ SidebarItem } path={ path }>
				{ title }
			</NavigatorButton>
		</li>
	);
};
