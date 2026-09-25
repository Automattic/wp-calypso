import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

const ActionPanelFigureList = ( {
	children,
	className,
}: PropsWithChildren< { className?: string } > ) => {
	return <ul className={ clsx( 'action-panel__figure-list', className ) }>{ children }</ul>;
};

export default ActionPanelFigureList;
