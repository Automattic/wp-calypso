/**
 * External dependencies
 */
import * as React from 'react';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

export const Title: React.FunctionComponent = ( { children } ) => (
	<h1 className="plans-ui-title">{ children }</h1>
);

export const SubTitle: React.FunctionComponent = ( { children } ) => (
	<h2 className="plans-ui-subtitle">{ children }</h2>
);
