/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { get, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import TranslatableString from 'calypso/components/translatable/proptype';
import ExpandableSidebarHeading from './expandable-heading';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import { hasTouch } from 'calypso/lib/touch-detect';
import config from 'calypso/config';

const isTouch = hasTouch();

function containsSelectedSidebarItem( children ) {
	let selectedItemFound = false;

	React.Children.forEach( children, ( child ) => {
		if ( selectedItemFound ) {
			return true;
		}

		if ( get( child, 'props.selected' ) ) {
			selectedItemFound = true;
		} else {
			const descendants = get( child, 'props.children' );

			if ( descendants ) {
				selectedItemFound = containsSelectedSidebarItem( descendants );
			}
		}
	} );

	return selectedItemFound;
}

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
	...props
} ) => {
	let { expanded } = props;
	const [ submenuHovered, setSubmenuHovered ] = useState( false );

	if ( null === expanded ) {
		expanded = containsSelectedSidebarItem( children );
	}

	const classes = classNames( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
		hovered: submenuHovered,
	} );

	const onEnter = () => {
		if ( expanded || isTouch ) return;
		setSubmenuHovered( true );
	};

	const onLeave = () => {
		if ( expanded || isTouch ) return;
		setSubmenuHovered( false );
	};

	const menuId = uniqueId( 'menu' );

	return (
		<SidebarMenu className={ classes }>
			<ExpandableSidebarHeading
				title={ title }
				count={ count }
				onClick={ onClick }
				customIcon={ customIcon }
				icon={ icon }
				materialIcon={ materialIcon }
				materialIconStyle={ materialIconStyle }
				expanded={ expanded }
				menuId={ menuId }
				onMouseEnter={ config.isEnabled( 'nav-unification' ) ? () => onEnter() : null }
				onMouseLeave={ config.isEnabled( 'nav-unification' ) ? () => onLeave() : null }
				{ ...props }
			/>
			<li role="region" id={ menuId } className="sidebar__expandable-content" hidden={ ! expanded }>
				<ul>{ children }</ul>
			</li>
		</SidebarMenu>
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
};

export default ExpandableSidebarMenu;
