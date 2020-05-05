/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ListItemField = ( { children, className } ) => {
	const classes = classNames( 'list-item-field', className );
	return <div className={ classes }>{ children }</div>;
};

ListItemField.propTypes = {
	className: PropTypes.string,
};

export default ListItemField;
