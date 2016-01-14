/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';

export default React.createClass( {
	displayName: 'StatsCommentTab',

	mixins: [ observe( 'dataList' ) ],

	propTypes: {
		dataList: PropTypes.object,
		dataKey: PropTypes.string,
		followList: PropTypes.object,
		name: PropTypes.string,
		value: PropTypes.string,
		label: PropTypes.string,
		isActive: PropTypes.bool
	},

	render() {
		const { dataList, dataKey, followList, isActive, name, value, label } = this.props;
		let statsList;

		if ( dataList.response.data && dataList.response.data[ dataKey ] ) {
			statsList = <StatsList
							moduleName={ name }
							data={ dataList.response.data[ dataKey ] }
							followList={ followList } />;
		}

		const classes = classNames( 'stats-comments__tab-content', { 'is-active': isActive } );

		return (
			<div className={ classes }>
				<StatsListLegend value={ value } label={ label } />
				{ statsList }
			</div>
		);
	}
} );
