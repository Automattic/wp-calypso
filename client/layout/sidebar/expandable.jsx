/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { get, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import TranslatableString from 'components/translatable/proptype';
import ExpandableSidebarHeading from './expandable-heading';
import SidebarMenu from 'layout/sidebar/menu';

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

export const ExpandableSidebarMenu = ( props ) => {
	const {
		className,
		title,
		count,
		onClick,
		icon,
		materialIcon,
		materialIconStyle,
		customIcon,
	} = props;

	let { expanded } = props;

	if ( null === expanded ) {
		expanded = containsSelectedSidebarItem( props.children );
	}

	const classes = classNames( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
	} );

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
			/>
			<div
				role="region"
				id={ menuId }
				className="sidebar__expandable-content"
				hidden={ ! expanded }
			>
				{ props.children }
			</div>
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
