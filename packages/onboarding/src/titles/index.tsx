import clsx from 'clsx';
import * as React from 'react';

import './styles.scss';

type AllowedTagNames = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
interface TitlesProps {
	className?: string;
	tagName?: AllowedTagNames;
	children?: string | React.ReactNode;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const Title: React.FunctionComponent< TitlesProps > = ( {
	className,
	children,
	tagName = 'h1',
	...rest
} ) =>
	React.createElement(
		tagName,
		{ className: clsx( 'onboarding-title', className ), ...rest },
		children
	);

export const SubTitle: React.FunctionComponent< TitlesProps > = ( {
	className,
	children,
	tagName = 'h2',
	...rest
} ) =>
	React.createElement(
		tagName,
		{ className: clsx( 'onboarding-subtitle', className ), ...rest },
		children
	);
