/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Row from './table-row';

const Table = ( { values, className, children } ) => {
	return (
		<Card className={ classnames( 'table', className ) }>
			<table>
				<thead>
					<Row isHeader values={ values } />
				</thead>
				<tbody>
					{ children }
				</tbody>
			</table>
		</Card>
	);
};

Table.propTypes = {
	values: PropTypes.array,
	className: PropTypes.string,
	children: PropTypes.node,
};

export default Table;
