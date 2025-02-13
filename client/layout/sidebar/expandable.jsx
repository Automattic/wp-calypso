import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Children, createRef, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { v4 as uuid } from 'uuid';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import HoverIntent from 'calypso/lib/hover-intent';
import { hasTouch } from 'calypso/lib/touch-detect';
import ExpandableSidebarHeading from './expandable-heading';

const isTouch = hasTouch();

function containsSelectedSidebarItem( children ) {
	let selectedItemFound = false;

	Children.forEach( children, ( child ) => {
		if ( selectedItemFound ) {
			return true;
		}

		if ( child?.props?.selected ) {
			selectedItemFound = true;
		} else {
			const descendants = child?.props?.children;

			if ( descendants ) {
				selectedItemFound = containsSelectedSidebarItem( descendants );
			}
		}
	} );

	return selectedItemFound;
}

const offScreen = ( submenu ) => {
	const rect = submenu.getBoundingClientRect();
	return rect.y + rect.height > window.innerHeight;
};

export const ExpandableSidebarMenu = ( {
	className,
	title,
	count,
	onClick,
	icon,
	materialIcon,
	materialIconStyle,
	customIcon,
	children,
	disableFlyout,
	...props
} ) => {
	let { expanded } = props;
	const menu = createRef(); // Needed for HoverIntent.
	const submenu = useRef();
	const [ submenuHovered, setSubmenuHovered ] = useState( false );

	if ( submenu.current ) {
		// Sets flyout to expand towards bottom.
		submenu.current.style.bottom = 'auto';
		submenu.current.style.top = 0;
	}

	if ( null === expanded ) {
		expanded = containsSelectedSidebarItem( children );
	}

	const classes = clsx( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
		hovered: submenuHovered,
	} );

	const onEnter = () => {
		if ( disableFlyout || expanded || isTouch ) {
			return;
		}

		setSubmenuHovered( true );
	};

	const onLeave = () => {
		// Remove "hovered" state even if menu is expanded.
		if ( isTouch ) {
			return;
		}

		setSubmenuHovered( false );
	};

	const menuId = useMemo( () => 'menu' + uuid(), [] );

	useLayoutEffect( () => {
		if ( submenuHovered && offScreen( submenu.current ) ) {
			// Sets flyout to expand towards top.
			submenu.current.style.bottom = 0;
			submenu.current.style.top = 'auto';
		}
	}, [ submenuHovered ] );

	return (
		<HoverIntent
			onMouseOver={ () => onEnter() }
			onMouseOut={ () => onLeave() }
			sensitivity={ 7 }
			interval={ 90 }
			timeout={ 200 }
		>
			<SidebarMenu ref={ menu } className={ classes }>
				<ExpandableSidebarHeading
					title={ title }
					count={ count }
					onClick={ ( event ) => {
						setSubmenuHovered( false );
						onClick( event );
					} }
					customIcon={ customIcon }
					icon={ icon }
					materialIcon={ materialIcon }
					materialIconStyle={ materialIconStyle }
					expanded={ expanded }
					menuId={ menuId }
					{ ...props }
				/>
				<li
					role="region"
					ref={ submenu }
					id={ menuId }
					className="sidebar__expandable-content"
					hidden={ ! expanded }
				>
					<ul>{ children }</ul>
				</li>
			</SidebarMenu>
		</HoverIntent>
	);
};

ExpandableSidebarMenu.propTypes = {
	title: PropTypes.oneOfType( [ TranslatableString, PropTypes.element ] ).isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
	customIcon: PropTypes.node,
	icon: PropTypes.string,
	materialIcon: PropTypes.string,
	materialIconStyle: PropTypes.string,
	expanded: PropTypes.bool,
	disableFlyout: PropTypes.bool,
	expandableIconClick: PropTypes.func,
};

export default ExpandableSidebarMenu;
