/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export const PreviewCardHeaderElement = ( {
	children,
	className,
} ) =>
	<div className={ classNames(
		'preview-card__header-element',
		'preview-card__overflow-ellipsis',
		className
	) }>
		{ children }
	</div>;

export default PreviewCardHeaderElement;
