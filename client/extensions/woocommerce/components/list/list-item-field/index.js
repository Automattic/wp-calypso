/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

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
