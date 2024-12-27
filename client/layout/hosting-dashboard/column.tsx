import clsx from 'clsx';
import React, { ReactNode } from 'react';
import Main from 'calypso/components/main';

import './style.scss';

type Props = {
	children: ReactNode;
	className?: string;
	wide?: boolean;
	withBorder?: boolean;
	compact?: boolean;
};

export default function LayoutColumn( { children, className, wide, withBorder, compact }: Props ) {
	return (
		<Main
			className={ clsx( 'hosting-dashboard-layout-column', className, {
				'is-with-border': withBorder,
				'is-compact': compact,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<div className="hosting-dashboard-layout-column__container">{ children }</div>
		</Main>
	);
}
