/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';

const StatsCommentTab = ( props ) => {
	const { data, followList, isActive, name, value, label } = props;
	let statsList;

	if ( data ) {
		statsList = <StatsList moduleName={ name } data={ data } followList={ followList } />;
	}

	const classes = classNames( 'stats-comments__tab-content', { 'is-active': isActive } );

	return (
		<div className={ classes }>
			<StatsListLegend value={ value } label={ label } />
			{ statsList }
		</div>
	);
};

StatsCommentTab.propTypes = {
	data: PropTypes.array,
	followList: PropTypes.object,
	name: PropTypes.string,
	value: PropTypes.string,
	label: PropTypes.string,
	isActive: PropTypes.bool,
};

export default StatsCommentTab;
