/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { get, maxBy } from 'lodash';

/**
 * Internal dependencies
 */
import { LegendItemPlaceholder } from 'components/legend-item';

function getLongestName( dataSeriesInfo ) {
	return get( maxBy( dataSeriesInfo, 'name.length' ), 'name', '' );
}

function PieChartLegendPlaceholder( { dataSeriesInfo } ) {
	const longestName = getLongestName( dataSeriesInfo );

	return (
		<div className="pie-chart__placeholder-legend">
			{ dataSeriesInfo.map( ( datumInfo ) => {
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

PieChartLegendPlaceholder.propTypes = {
	dataSeriesInfo: PropTypes.arrayOf(
		PropTypes.shape( {
			description: PropTypes.string,
			name: PropTypes.string.isRequired,
		} )
	).isRequired,
};

export default PieChartLegendPlaceholder;
