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
import { privateApis as routerPrivateApis } from '@wordpress/router';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { SidebarNavigationContext } from '../sidebar';

const { useHistory, useLink } = unlock( routerPrivateApis );

export default function SidebarNavigationItem( {
	className,
	icon,
	withChevron = false,
	suffix,
	uid,
	to,
	onClick,
	children,
	...props
} ) {
	const history = useHistory();
	const { navigate } = useContext( SidebarNavigationContext );
	// If there is no custom click handler, create one that navigates to `params`.
	function handleClick( e ) {
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
				'edit-site-sidebar-navigation-item',
				{ 'with-suffix': ! withChevron && suffix },
				className
			) }
			id={ uid }
			onClick={ handleClick }
			href={ to ? linkProps.href : undefined }
			{ ...props }
		>
			<HStack justify="flex-start">
				{ icon && <Icon style={ { fill: 'currentcolor' } } icon={ icon } size={ 24 } /> }
				<FlexBlock>{ children }</FlexBlock>
				{ withChevron && (
					<Icon
						icon={ isRTL() ? chevronLeftSmall : chevronRightSmall }
						className="edit-site-sidebar-navigation-item__drilldown-indicator"
						size={ 24 }
					/>
				) }
				{ ! withChevron && suffix }
			</HStack>
		</Item>
	);
}
