import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ReactNode, LegacyRef } from 'react';

const SidebarMenu = forwardRef(
	(
		{ children, className, ...props }: { children: ReactNode; className?: string },
		ref: LegacyRef< HTMLUListElement >
	) => (
		<ul ref={ ref } className={ classNames( 'sidebar__menu', className ) } { ...props }>
			{ children }
		</ul>
	)
);

export default SidebarMenu;
