import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

const ActionPanelCta = ( { children, className }: PropsWithChildren< { className?: string } > ) => {
	return <div className={ clsx( 'action-panel__cta', className ) }>{ children }</div>;
};

export default ActionPanelCta;
