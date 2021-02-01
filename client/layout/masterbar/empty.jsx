/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style dependencies
 */

const EmptyMasterbar = ( { className } ) => (
	<header id="header" className={ classNames( 'masterbar', className ) } />
);

EmptyMasterbar.propTypes = {
	className: PropTypes.string,
};

export default EmptyMasterbar;
