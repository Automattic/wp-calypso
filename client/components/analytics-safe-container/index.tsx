/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';

const AnalyticsSafeContainer: FunctionComponent = ( { children } ) => (
	<div className={ classnames( 'analytics-safe-container', 'fs-exclude' ) }>{ children }</div>
);

export default AnalyticsSafeContainer;
