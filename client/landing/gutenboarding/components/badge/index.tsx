import classNames from 'classnames';
import type { PropsWithChildren, FunctionComponent } from 'react';

import './style.scss';

type Props = PropsWithChildren< { className?: string } >;

const Badge: FunctionComponent< Props > = ( { children, className, ...props } ) => (
	<span { ...props } className={ classNames( 'badge', className ) }>
		{ children }
	</span>
);

export default Badge;
