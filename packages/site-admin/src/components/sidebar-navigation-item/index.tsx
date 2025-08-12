/**
 * External dependencies
 */
import {
	__experimentalItem as Item,
	__experimentalHStack as HStack,
	FlexBlock,
} from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n';
import { chevronRightSmall, chevronLeftSmall, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { ComponentProps } from 'react';
/**
 * Internal dependencies
 */
import { SidebarNavigationContext } from '../../components';
import { useHistory, useLink } from '../../router';

import './style.scss';

type SidebarNavigationItemProps = {
	suffix?: 'CHEVRON' | React.ReactNode;
	uid: string;
	to?: string;
	icon?: React.ReactElement;
} & ComponentProps< typeof Item >;

export function SidebarNavigationItem( {
	suffix,
	uid,
	to = '',
	icon,
	className,
	onClick,
	children,
	...props
}: SidebarNavigationItemProps ) {
	const history = useHistory();
	const { navigate } = useContext( SidebarNavigationContext );

	// If there is no custom click handler, create one that navigates to `params`.
	function handleClick( e: React.MouseEvent< HTMLDivElement > ) {
		if ( onClick ) {
			onClick( e );
			navigate( 'forward' );
		} else if ( to ) {
			e.preventDefault();
			history.navigate( to );
			navigate( 'forward', `[id="${ uid }"]` );
		}
	}

	const { href } = useLink( to );

	return (
		<Item
			className={ clsx(
				'a8c-site-admin-sidebar-navigation-item',
				{ 'with-suffix': typeof suffix !== 'undefined' },
				className
			) }
			id={ uid }
			as={ onClick ? 'button' : 'a' }
			{ ...props }
			onClick={ handleClick }
			href={ to ? href : undefined }
		>
			<HStack justify="flex-start">
				{ icon && <Icon icon={ icon } size={ 24 } /> }
				<FlexBlock>{ children }</FlexBlock>
				{ suffix === 'CHEVRON' ? (
					<Icon
						icon={ isRTL() ? chevronLeftSmall : chevronRightSmall }
						className="a8c-site-admin-sidebar-navigation-item__drilldown-indicator"
						size={ 24 }
					/>
				) : (
					suffix
				) }
			</HStack>
		</Item>
	);
}
