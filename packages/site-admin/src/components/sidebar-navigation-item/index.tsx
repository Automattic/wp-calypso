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
/**
 * Internal dependencies
 */
import { SidebarNavigationContext } from '../../components';
import { useHistory, useLink } from '../../router';

import './style.scss';

export type SidebarNavigationItemProps = {
	className?: string;
	withChevron?: boolean;
	suffix?: JSX.Element;
	uid: string;
	to?: string;
	as?: 'button' | 'a';
	onClick?: ( e: React.MouseEvent ) => void;
	children: React.ReactNode;
	icon?: React.ReactElement;
};

export function SidebarNavigationItem( {
	className,
	icon,
	withChevron = false,
	suffix,
	uid,
	to = '', // default value is not defined in the core component.
	as = 'button', // `as` prop is not defined in the core component.
	onClick,
	children,
	...props
}: SidebarNavigationItemProps ) {
	const history = useHistory();
	const { navigate } = useContext( SidebarNavigationContext );

	// If there is no custom click handler, create one that navigates to `params`.
	function handleClick( e: React.MouseEvent ) {
		if ( onClick ) {
			onClick( e );
			navigate( 'forward' );
		} else if ( to ) {
			e.preventDefault();
			history.navigate( to );
			navigate( 'forward', `[id="${ uid }"]` );
		}
	}
	const linkProps = useLink( to );

	return (
		<Item
			className={ clsx(
				'site-admin-sidebar-navigation-item',
				{ 'with-suffix': ! withChevron && suffix },
				className
			) }
			id={ uid }
			onClick={ handleClick }
			href={ to ? linkProps.href : undefined }
			as={ as }
			{ ...props }
		>
			<HStack justify="flex-start">
				{ icon && <Icon style={ { fill: 'currentcolor' } } icon={ icon } size={ 24 } /> }
				<FlexBlock>{ children }</FlexBlock>
				{ withChevron && (
					<Icon
						icon={ isRTL() ? chevronLeftSmall : chevronRightSmall }
						className="site-admin-sidebar-navigation-item__drilldown-indicator"
						size={ 24 }
					/>
				) }
				{ ! withChevron && suffix }
			</HStack>
		</Item>
	);
}
