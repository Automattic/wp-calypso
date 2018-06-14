/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import LegendItemPlaceholder from 'components/legend-item/placeholder';

class PieChartLegendPlaceholder extends Component {
	static propTypes = {
		dataSeriesInfo: PropTypes.arrayOf(
			PropTypes.shape( {
				description: PropTypes.string,
				name: PropTypes.string.isRequired,
			} )
		).isRequired,
	};

	static getDerivedStateFromProps( props, state ) {
		const longestName = props.dataSeriesInfo.reduce(
			( intermediateLongestName, currentValue ) =>
				intermediateLongestName.length > currentValue.name.length
					? intermediateLongestName
					: currentValue.name,
			''
		);

		return state.longestName !== longestName ? { longestName } : null;
	}

	state = {
		longestName: '',
	};

	render() {
		const { dataSeriesInfo } = this.props;
		const { longestName } = this.state;

		return (
			<div className="pie-chart__placeholder-legend">
				{ dataSeriesInfo.map( datumInfo => {
					return (
						<LegendItemPlaceholder
							key={ datumInfo.name }
							name={ longestName }
							description={ datumInfo.description }
						/>
					);
				} ) }
			</div>
		);
	}
}

export default PieChartLegendPlaceholder;
