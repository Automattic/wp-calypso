/**
 * External dependencies
 */
import * as React from 'react';

import './titles.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

export const Title: React.FunctionComponent = ( { children } ) => (
	<h1 className="gutenboarding-title">{ children }</h1>
);

export const SubTitle: React.FunctionComponent = ( { children } ) => (
	<h2 className="gutenboarding-subtitle">{ children }</h2>
);
