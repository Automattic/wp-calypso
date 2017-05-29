/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import classNames from 'classnames';

export const PreviewCardAction = ( {
	className,
	href,
	icon,
	label,
	onClick,
} ) =>
	<a
		className={ classNames( 'preview-card__action', className, { 'has-icon': icon } ) }
		href={ href }
		onClick={ onClick }
	>
		{ icon && <Gridicon icon={ icon } /> }
		{ label && <span>{ label }</span> }
	</a>;

export default PreviewCardAction;
