/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const Table = ( { className, compact, header, hasBorder, children, ...props } ) => {
	const classes = classnames( {
		table: true,
		'has-border': hasBorder,
		'is-compact': compact,
	}, className );
	return (
		<Card className={ classes }>
			<table { ...props }>
				{ header
					? <thead>{ header }</thead>
					: null
				}
				<tbody>
					{ children }
				</tbody>
			</table>
		</Card>
	);
};

Table.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node,
	compact: PropTypes.bool,
	header: PropTypes.node,
	hasBorder: PropTypes.bool,
};

export default Table;
