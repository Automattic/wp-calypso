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

export const PostControl = ( { control } ) =>
	<li className={ classNames( { 'post-controls__disabled': control.disabled } ) } >
		<a
			className={ `post-controls__${ control.className }` }
			href={ control.href }
			onClick={ control.disabled ? noop : control.onClick }
			target={ control.target ? control.target : null }
		>
			<Gridicon icon={ control.icon } size={ 18 } />
			<span>
				{ control.text }
			</span>
		</a>
	</li>;

export default PostControl;
