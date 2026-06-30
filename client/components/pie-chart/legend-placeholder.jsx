import { maxBy } from '@automattic/js-utils';
import PropTypes from 'prop-types';
import { LegendItemPlaceholder } from 'calypso/components/legend-item';

function getLongestName( dataSeriesInfo ) {
	return maxBy( dataSeriesInfo, ( d ) => d?.name?.length )?.name ?? '';
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
