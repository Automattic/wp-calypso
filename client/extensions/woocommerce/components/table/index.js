/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

const Table = ( {
	className,
	compact = false,
	horizontalScroll = false,
	header,
	children,
	...props
} ) => {
	const classes = classnames(
		{
			table: true,
			'is-compact-table': compact,
			'is-horizontally-scrollable': horizontalScroll,
		},
		className
	);
	return (
		<Card className={ classes }>
			<div className="table__wrapper-shadow">
				<div className="table__wrapper">
					<table { ...props }>
						{ header && <thead>{ header }</thead> }
						<tbody>{ children }</tbody>
					</table>
				</div>
			</div>
		</Card>
	);
};

Table.propTypes = {
	className: PropTypes.string,
	compact: PropTypes.bool,
	horizontalScroll: PropTypes.bool,
	header: PropTypes.node,
};

export default Table;
