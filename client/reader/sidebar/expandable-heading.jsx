/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SidebarHeading from 'layout/sidebar/heading';
import Count from 'components/count';

const ExpandableSidebarHeading = ( { title, count, onClick } ) => (
	<SidebarHeading onClick={ onClick }>
		<Gridicon icon="chevron-down" />
		<span>{ title }</span>
		<Count count={ count } />
	</SidebarHeading>
);

ExpandableSidebarHeading.propTypes = {
	title: PropTypes.string.isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
