import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

import './style.scss';

// @TODO: move to '@automattic/components' and reuse in Gutenboarding

type Props = PropsWithChildren< {
	className?: string;
} >;

const Badge = ( { children, className, ...props }: Props ) => (
	<span { ...props } className={ classNames( 'badge', className ) }>
		{ children }
	</span>
);

export default Badge;
