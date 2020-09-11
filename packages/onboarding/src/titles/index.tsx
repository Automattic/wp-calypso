/**
 * External dependencies
 */
import * as React from 'react';

import './styles.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

export const Title: React.FunctionComponent = ( { children } ) => (
	<h1 className="onboarding-title">{ children }</h1>
);

export const SubTitle: React.FunctionComponent = ( { children } ) => (
	<h2 className="onboarding-subtitle">{ children }</h2>
);
