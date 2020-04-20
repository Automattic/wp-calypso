/**
 * External dependencies
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

const DashboardWidgetRow = ( props ) => {
	const { children, className } = props;
	const classes = classNames( 'dashboard-widget__row', className );

	return <div className={ classes }>{ children }</div>;
};

DashboardWidgetRow.propTypes = {
	className: PropTypes.string,
};

export default DashboardWidgetRow;
