import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

const ActionPanelFigureHeader = ( {
	children,
	className,
}: PropsWithChildren< { className?: string } > ) => {
	return <h3 className={ clsx( 'action-panel__figure-header', className ) }>{ children }</h3>;
};

export default ActionPanelFigureHeader;
