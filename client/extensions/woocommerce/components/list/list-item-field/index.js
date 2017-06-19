/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

const ListItemField = ( { children, className } ) => {
	const classes = classNames( 'list-item-field', className );
	return (
		<div className={ classes }>
			{ children }
		</div>
	);
};

ListItemField.propTypes = {
	className: PropTypes.string,
};

export default ListItemField;
