/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export const PreviewCardContentElement = ( {
	children,
	className,
} ) =>
	<div className={ classNames(
		'preview-card__content-element',
		'preview-card__overflow-ellipsis',
		className
	) }>
		{ children }
	</div>;

export default PreviewCardContentElement;
