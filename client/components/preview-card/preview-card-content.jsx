/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export const PreviewCardContent = ( {
	children,
	className,
} ) =>
	<div className={ classNames( 'preview-card__content', className ) }>
		{ children }
	</div>;

export default PreviewCardContent;
