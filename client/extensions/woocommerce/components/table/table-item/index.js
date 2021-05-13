/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function getScope( isHeader, isRowHeader ) {
	if ( isHeader ) {
		return 'col';
	}
	if ( isRowHeader ) {
		return 'row';
	}
	return null;
}

const TableItem = ( {
	className,
	isHeader,
	isRowHeader,
	isTitle,
	children,
	alignRight,
	...props
} ) => {
	const isHeading = isHeader || isRowHeader;
	const classes = classNames(
		{
			'table-heading': isHeader,
			'table-item': ! isHeader,
			'is-title-cell': isTitle,
			'is-row-heading': isRowHeader,
			'is-align-right': alignRight,
		},
		className
	);

	const Cell = isHeading ? 'th' : 'td';
	const scope = getScope( isHeader, isRowHeader );

	return (
		<Cell className={ classes } scope={ scope } { ...props }>
			{ isTitle ? <div className="table-item__cell-title">{ children }</div> : children }
		</Cell>
	);
};

TableItem.propTypes = {
	alignRight: PropTypes.bool,
	className: PropTypes.string,
	isHeader: PropTypes.bool,
	isRowHeader: PropTypes.bool,
	isTitle: PropTypes.bool,
};

export default TableItem;
