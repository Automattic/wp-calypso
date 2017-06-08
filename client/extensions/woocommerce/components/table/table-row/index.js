/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

const TableRow = ( { className, isHeader, children, ...props } ) => {
	const rowClasses = classnames( 'table-row', className, {
		'is-header': isHeader,
	} );

	return (
		<tr className={ rowClasses } { ...props }>
			{ children }
		</tr>
	);
};

TableRow.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	isHeader: PropTypes.bool,
};

export default TableRow;
