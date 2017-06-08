/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

const TableItem = ( { className, isHeader, isTitle, children, ...props } ) => {
	const classes = classNames( {
		'table-heading': isHeader,
		'table-item': ! isHeader,
		'is-title-cell': isTitle,
	}, className );

	const Cell = isHeader ? 'th' : 'td';

	if ( isHeader ) {
		props.scope = props.scope || 'col';
	}

	return (
		<Cell className={ classes } { ...props }>
			{ isTitle
				? <div className="table-item__cell-title" >{ children }</div>
				: children
			}
		</Cell>
	);
};

TableItem.propTypes = {
	className: PropTypes.string,
	isHeader: PropTypes.bool,
	isTitle: PropTypes.bool,
	children: PropTypes.node,
};

export default TableItem;
