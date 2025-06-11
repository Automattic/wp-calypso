import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noPadding,
}: {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noPadding?: 'top' | 'all';
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', `axis-${ axisDirection }`, {
				'center-aligned': centerAligned,
				'no-top-padding': noPadding === 'top',
				'no-padding': noPadding === 'all',
			} ) }
		>
			{ children }
		</div>
	);
};
