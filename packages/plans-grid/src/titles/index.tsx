/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

export const Title: React.FunctionComponent = ( { children } ) => (
	<h1 className="plans-ui-title">{ children }</h1>
);
