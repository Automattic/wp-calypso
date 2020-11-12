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

const PatternBadge: React.FunctionComponent< Props > = ( { children, className, ...props } ) => (
	<span { ...props } className={ classNames( 'pattern-badge', className ) }>
		{ children }
	</span>
);

export default PatternBadge;
