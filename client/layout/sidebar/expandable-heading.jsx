/**
 * External dependencies
 */
import Gridicon from 'components/gridicon';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import MaterialIcon from 'components/material-icon';
import SidebarHeading from 'layout/sidebar/heading';
import TranslatableString from 'components/translatable/proptype';

const ExpandableSidebarHeading = ( {
	title,
	count,
	onClick,
	icon,
	materialIcon,
	materialIconStyle,
	expanded,
	menuId,
} ) => {
	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			onClick={ onClick }
		>
			{ icon && <Gridicon className="sidebar__menu-icon" icon={ icon } /> }
			{ materialIcon && (
				<MaterialIcon
					className="sidebar__menu-icon"
					icon={ materialIcon }
					style={ materialIconStyle }
				/>
			) }
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
	icon: PropTypes.string,
	materialIcon: PropTypes.string,
	materialIconStyle: PropTypes.string,
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
