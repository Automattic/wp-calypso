import classNames from 'classnames';
import type { ReactElement, FunctionComponent } from 'react';

import './style.scss';

interface Props {
	children: ReactElement[];
	className?: string;
}

const Badge: FunctionComponent< Props > = ( { children, className, ...props } ) => (
	<span { ...props } className={ classNames( 'badge', className ) }>
		{ children }
	</span>
);

export default Badge;
