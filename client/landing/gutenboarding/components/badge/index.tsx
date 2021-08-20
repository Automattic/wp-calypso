import classNames from 'classnames';
import * as React from 'react';

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
