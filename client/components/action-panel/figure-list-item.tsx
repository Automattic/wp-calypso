import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

const ActionPanelFigureListItem = ( {
	children,
	className,
}: PropsWithChildren< { className?: string } > ) => {
	return <li className={ clsx( 'action-panel__figure-list-item', className ) }>{ children }</li>;
};

export default ActionPanelFigureListItem;
