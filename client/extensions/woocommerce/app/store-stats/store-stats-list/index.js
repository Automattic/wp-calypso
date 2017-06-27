/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

const StoreStatsList = ( { data, values } ) => {
	const titles = (
		<TableRow isHeader>
			{ values.map( ( value, i ) => {
				return <TableItem isHeader key={ i } isTitle={ 0 === i }>{ value.title }</TableItem>;
			} ) }
		</TableRow>
	);
	return (
		<Table header={ titles } compact>
			{ data.map( ( row, i ) => (
				<TableRow key={ i }>
					{ values.map( ( value, j ) => (
						<TableItem key={ value.key } isTitle={ 0 === j }>{ row[ value.key ] }</TableItem>
					) ) }
				</TableRow>
			) ) }
		</Table>
	);
};

StoreStatsList.propTypes = {
	data: PropTypes.array.isRequired,
	values: PropTypes.array.isRequired,
};

export default connect(
	( state, { siteId, statType, query } ) => {
		return {
			data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		};
	}
)( StoreStatsList );
