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
import { unstableResourceWarning } from '../../../../../debug';
import { useHistory, useLink } from '../../../../router/src';
import { SidebarNavigationContext } from '../sidebar';
import './style.scss'; // @Todo: different from core: not imported in this way

// import { unlock } from '../../lock-unlock';
// import { privateApis as routerPrivateApis } from '@wordpress/router';

type SidebarNavigationItemProps = {
	className?: string;
	withChevron?: boolean;
	suffix?: JSX.Element;
	uid: string;
	to?: string;
	as?: 'button' | 'a'; // @Todo: @unstable: added 'as' prop
	onClick?: ( e: React.MouseEvent ) => void;
	children: React.ReactNode;
	icon?: React.ReactElement;
};

export default function SidebarNavigationItem( {
	className,
	icon,
	withChevron = false,
	suffix,
	uid,
	to = '', // @Todo: @unstable: added default value
	as, // @Todo: @unstable: added 'as' prop
	onClick,
	children,
	...props
}: SidebarNavigationItemProps ) {
	unstableResourceWarning(
		'<SidebarNavigationItem />',
		'https://github.com/WordPress/gutenberg/blob/56883338749aa23acc75481c3bbc605bf1cb5a81/packages/edit-site/src/components/sidebar-navigation-item/index.js#L27'
	);

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
				'edit-site-sidebar-navigation-item',
				{ 'with-suffix': ! withChevron && suffix },
				className
			) }
			id={ uid }
			onClick={ handleClick }
			href={ to ? linkProps.href : undefined }
			as={ as || to ? 'a' : 'button' } // @Todo: @unstable: added 'as' prop
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
