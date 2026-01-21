import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type ContentWrapperProps = {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noTopPadding?: boolean;
	noBottomPadding?: boolean;
	noPadding?: boolean;
	isFullWidth?: boolean;
};

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noTopPadding = false,
	noBottomPadding = false,
	noPadding = false,
	isFullWidth = false,
}: ContentWrapperProps ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', `axis-${ axisDirection }`, {
				'center-aligned': centerAligned,
				'no-top-padding': noTopPadding,
				'no-bottom-padding': noBottomPadding,
				'no-padding': noPadding,
				'is-full-width': isFullWidth,
			} ) }
		>
			{ children }
		</div>
	);
};
