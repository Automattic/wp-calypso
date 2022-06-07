import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

const ActionPanelCta = ( { children, className }: PropsWithChildren< { className?: string } > ) => {
	return <div className={ classNames( 'action-panel__cta', className ) }>{ children }</div>;
};

export default ActionPanelCta;
