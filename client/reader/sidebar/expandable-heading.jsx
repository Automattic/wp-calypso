/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import SidebarHeading from 'layout/sidebar/heading';
import Gridicon from 'components/gridicon';
import Count from 'components/count';

const ExpandableSidebarHeading = ( { title, count, onClick } ) => (
	<SidebarHeading onClick={ onClick }>
		<Gridicon icon="chevron-down" />
		<span>{ title }</span>
		<Count count={ count } />
	</SidebarHeading>
);

ExpandableSidebarHeading.propTypes = {
	title: React.PropTypes.string.isRequired,
	count: React.PropTypes.number,
	onClick: React.PropTypes.func
};

ExpandableSidebarHeading.defaultProps = {
	onClick: noop
};

export default ExpandableSidebarHeading;
