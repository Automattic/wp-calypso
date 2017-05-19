/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export const PreviewCardHeader = ( {
	children,
	className,
	onClick,
} ) =>
	<div className={ classNames( 'preview-card__header', className ) } onClick={ onClick }>
		{ children }
	</div>;

export default PreviewCardHeader;
