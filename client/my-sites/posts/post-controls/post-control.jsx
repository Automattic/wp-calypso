/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export const PostControl = ( {
	className,
	disabled,
	href,
	icon,
	onClick,
	target,
	text,
} ) =>
	<li className={ classNames(
		'post-control',
		{ 'is-disabled': disabled }
	) } >
		<a
			className={ `post-control__${ className }` }
			href={ href }
			onClick={ disabled ? noop : onClick }
			target={ target ? target : null }
		>
			<Gridicon icon={ icon } size={ 18 } />
			<span>
				{ text }
			</span>
		</a>
	</li>;

export default PostControl;
