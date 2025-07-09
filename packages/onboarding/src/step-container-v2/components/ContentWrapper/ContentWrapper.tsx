import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noTopPadding = false,
}: {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noTopPadding?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', `axis-${ axisDirection }`, {
				'center-aligned': centerAligned,
				'no-top-padding': noTopPadding,
			} ) }
		>
			{ children }
		</div>
	);
};
