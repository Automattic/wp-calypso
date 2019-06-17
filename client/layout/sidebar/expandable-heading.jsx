/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
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
	expanded,
	menuId,
} ) => {
	return (
		<SidebarHeading
			aria-controls={ menuId }
			aria-expanded={ expanded ? 'true' : 'false' }
			onClick={ onClick }
		>
			{ icon ? <Gridicon icon={ icon } /> : null }
			{ materialIcon ? <MaterialIcon icon={ materialIcon } /> : null }
			<span>{ title }</span>
			{ undefined !== count ? <Count count={ count } /> : null }
			<MaterialIcon icon={ 'keyboard_arrow_down' } className="expandable-heading__chevron" />
		</SidebarHeading>
	);
};

ExpandableSidebarHeading.propTypes = {
	title: TranslatableString.isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
	icon: PropTypes.string,
	materialIcon: PropTypes.string,
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
