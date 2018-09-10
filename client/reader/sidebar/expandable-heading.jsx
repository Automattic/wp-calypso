/** @format */
/**
 * External dependencies
 */
import GridiconChevronDown from 'gridicons/dist/chevron-down';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import SidebarHeading from 'layout/sidebar/heading';
import TranslatableString from 'components/translatable/proptype';

const ExpandableSidebarHeading = ( { title, count, onClick } ) => (
	<SidebarHeading onClick={ onClick }>
		<GridiconChevronDown />
		<span>{ title }</span>
		<Count count={ count } />
	</SidebarHeading>
);

ExpandableSidebarHeading.propTypes = {
	title: TranslatableString.isRequired,
	count: PropTypes.number,
	onClick: PropTypes.func,
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop,
};

export default ExpandableSidebarHeading;
