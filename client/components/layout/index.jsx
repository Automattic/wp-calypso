/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default function Layout( { children, className } ) {
	const layoutClasses = classnames( 'layout-wrapper', className );

	return <div className={ layoutClasses }>{ children }</div>;
}

Layout.propTypes = {
	className: PropTypes.string,
};
