import classNames from 'classnames';
import type { ReactNode } from 'react';

const ActionPanelCta = ( {
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
} ): JSX.Element => {
	return <div className={ classNames( 'action-panel__cta', className ) }>{ children }</div>;
};

export default ActionPanelCta;
