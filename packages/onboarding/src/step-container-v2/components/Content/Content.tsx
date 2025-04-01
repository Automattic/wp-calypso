import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

export const Content = ( { children, className }: { children: ReactNode; className?: string } ) => {
	return <div className={ clsx( 'step-container-v2__content', className ) }>{ children }</div>;
};
