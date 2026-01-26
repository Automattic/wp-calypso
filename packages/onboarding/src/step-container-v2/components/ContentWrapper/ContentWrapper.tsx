import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type ContentWrapperProps = {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noTopPadding?: boolean;
	noBottomPadding?: boolean;
	noInlinePadding?: boolean;
	isFullWidth?: boolean;
	noGap?: boolean;
};

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noTopPadding = false,
	noBottomPadding = false,
	noInlinePadding = false,
	isFullWidth = false,
	noGap = false,
}: ContentWrapperProps ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', `axis-${ axisDirection }`, {
				'center-aligned': centerAligned,
				'no-top-padding': noTopPadding,
				'no-bottom-padding': noBottomPadding,
				'no-inline-padding': noInlinePadding,
				'is-full-width': isFullWidth,
				'no-gap': noGap,
			} ) }
		>
			{ children }
		</div>
	);
};
