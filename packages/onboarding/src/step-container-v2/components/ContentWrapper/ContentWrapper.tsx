import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noTopPadding = false,
	className,
}: {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noTopPadding?: boolean;
	className?: string;
} ) => {
	return (
		<div
			className={ clsx(
				'step-container-v2__content-wrapper',
				`axis-${ axisDirection }`,
				{
					'center-aligned': centerAligned,
					'no-top-padding': noTopPadding,
				},
				className
			) }
		>
			{ children }
		</div>
	);
};
