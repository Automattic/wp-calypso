/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';

import './styles.scss';

type AllowedTagNames = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
interface TitlesProps {
	className?: string;
	tagName?: AllowedTagNames;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const Title: React.FunctionComponent< TitlesProps > = ( {
	className,
	children,
	tagName = 'h1',
} ) =>
	React.createElement(
		tagName,
		{ className: classnames( 'onboarding-title', className ) },
		children
	);

export const SubTitle: React.FunctionComponent< TitlesProps > = ( {
	className,
	children,
	tagName = 'h2',
} ) =>
	React.createElement(
		tagName,
		{ className: classnames( 'onboarding-subtitle', className ) },
		children
	);
