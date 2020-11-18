/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';

import './styles.scss';

interface TitlesProps {
	className?: string;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const Title: React.FunctionComponent< TitlesProps > = ( { className, children } ) => (
	<h1 className={ classnames( 'onboarding-title', className ) }>{ children }</h1>
);

export const SubTitle: React.FunctionComponent< TitlesProps > = ( { className, children } ) => (
	<h2 className={ classnames( 'onboarding-subtitle', className ) }>{ children }</h2>
);
