import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	width,
}: {
	children: ReactNode;
	width?: 'wide' | 'full';
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', {
				wide: width === 'wide',
				full: width === 'full',
			} ) }
		>
			{ children }
		</div>
	);
};
