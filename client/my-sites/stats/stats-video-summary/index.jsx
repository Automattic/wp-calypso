/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import SummaryChart from '../stats-summary';

const StatsVideoSummary = React.createClass( {
	propTypes: {
		dataList: PropTypes.object.isRequired,
	},

	mixins: [ observe( 'dataList' ) ],

	getInitialState: function() {
		const chartDataLength = this.props.dataList.response.data ? this.props.dataList.response.data.length : null;

		return {
			selectedBar: chartDataLength ? this.props.dataList.response.data[ chartDataLength - 1 ] : null
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		const chartDataLength = nextProps.dataList.response.data ? nextProps.dataList.response.data.length : null;
		// Always default to the last bar being selected
		if ( ! this.state.selectedBar && chartDataLength ) {
			this.setState( {
				selectedBar: nextProps.dataList.response.data[ chartDataLength - 1 ]
			} );
		}
	},

	selectBar: function( bar ) {
		this.setState( {
			selectedBar: bar
		} );
	},

	render: function() {
		const { translate } = this.props;

		return (
			<SummaryChart
				isLoading={ this.props.dataList.isLoading() }
				data={ this.props.dataList.response.data }
				activeKey="period"
				dataKey="value"
				labelKey="period"
				labelClass="video"
				sectionClass="is-video"
				selected={ this.state.selectedBar }
				onClick={ this.selectBar }
				tabLabel={ translate( 'Plays' ) }
			/>
		);
	}
} );

export default localize( StatsVideoSummary );
