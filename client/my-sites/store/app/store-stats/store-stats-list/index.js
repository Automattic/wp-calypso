import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import Table from '../../../components/table';
import TableItem from '../../../components/table/table-item';
import TableRow from '../../../components/table/table-row';
import { formatValue } from '../utils';

const StoreStatsList = ( { data, values } ) => {
	const titles = (
		<TableRow isHeader>
			{ values.map( ( value, i ) => {
				return (
					<TableItem isHeader key={ i } isTitle={ 0 === i }>
						{ value.title }
					</TableItem>
				);
			} ) }
		</TableRow>
	);
	return (
		<Table header={ titles } compact>
			{ data.map( ( row, i ) => (
				<TableRow key={ i }>
					{ values.map( ( value, j ) => (
						<TableItem key={ value.key } isTitle={ 0 === j }>
							{ formatValue( row[ value.key ], value.format, row.currency ) }
						</TableItem>
					) ) }
				</TableRow>
			) ) }
		</Table>
	);
};

StoreStatsList.propTypes = {
	data: PropTypes.array.isRequired,
	values: PropTypes.array.isRequired,
	fetchedData: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ),
};

export default connect( ( state, { siteId, statType, query, fetchedData } ) => {
	const data = fetchedData
		? fetchedData
		: getSiteStatsNormalizedData( state, siteId, statType, query );
	return {
		data,
	};
} )( StoreStatsList );
