/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

const Row = ( { values, className, isHeader } ) => {
	const El = isHeader ? 'th' : 'td';
	const rowClasses = classnames( 'table-row', className, {
		'is-header': isHeader,
	} );

	return (
		<tr className={ rowClasses }>
			{ values.map( ( value, index ) => {
				if ( index === 0 ) {
					return (
						<El className={ 'table-row__cell is-title-cell' } key={ value + index }>
							<div className="table-row__cell-title" >{ value }</div>
						</El>
					);
				}
				return (
					<El className={ 'table-row__cell' } key={ value + index }>{ value }</El>
				);
			} ) }
		</tr>
	);
};

Row.propTypes = {
	isHeader: PropTypes.bool,
	values: PropTypes.array,
	className: PropTypes.string,
};

export default Row;
