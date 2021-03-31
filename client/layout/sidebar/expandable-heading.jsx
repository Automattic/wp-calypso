/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'calypso/components/count';
import MaterialIcon from 'calypso/components/material-icon';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import TranslatableString from 'calypso/components/translatable/proptype';
import { decodeEntities } from 'calypso/lib/formatting';

const noop = () => {};

const ExpandableSidebarHeading = ( {
	title,
	count,
	onClick,
	icon,
	customIcon,
	materialIcon,
	materialIconStyle,
	expanded,
	menuId,
	hideExpandableIcon,
	...props
} ) => {
	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			onClick={ onClick }
			{ ...props }
		>
			{ icon && <Gridicon className="sidebar__menu-icon" icon={ icon } /> }
			{ materialIcon && (
				<MaterialIcon
					className="sidebar__menu-icon"
					icon={ materialIcon }
					style={ materialIconStyle }
				/>
			) }
			{ undefined !== customIcon && customIcon }
			<span className="sidebar__expandable-title">
				{ decodeEntities( title ) }
				{ undefined !== count && <Count count={ count } /> }
			</span>
			{ ! hideExpandableIcon && (
				<MaterialIcon icon="keyboard_arrow_down" className="sidebar__expandable-arrow" />
			) }
		</SidebarHeading>
	);
};

ExpandableSidebarHeading.propTypes = {
	title: PropTypes.oneOfType( [ TranslatableString, PropTypes.element ] ).isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
	customIcon: PropTypes.node,
	icon: PropTypes.string,
	materialIcon: PropTypes.string,
	materialIconStyle: PropTypes.string,
	hideExpandableIcon: PropTypes.bool,
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
