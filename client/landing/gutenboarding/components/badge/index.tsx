/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	children: React.ReactElement[];
	className?: string;
}

const Badge: React.FunctionComponent< Props > = ( { children, className, ...props } ) => (
	<span { ...props } className={ classNames( 'badge', className ) }>
		{ children }
	</span>
);

export default Badge;
