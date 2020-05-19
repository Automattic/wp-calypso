/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const Badge: React.FunctionComponent = ( { children, className, ...props } ) => (
	<span { ...props } className={ classNames( 'badge', className ) }>
		{ children }
	</span>
);

export default Badge;
