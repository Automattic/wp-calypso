/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'calypso/components/count';
import MaterialIcon from 'calypso/components/material-icon';
import SidebarHeading from 'calypso/layout/sidebar/heading';
import TranslatableString from 'calypso/components/translatable/proptype';

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
			<span className="sidebar__expandable-title">{ title }</span>
			{ undefined !== count && <Count count={ count } /> }
			<MaterialIcon icon="keyboard_arrow_down" className="sidebar__expandable-arrow" />
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
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
