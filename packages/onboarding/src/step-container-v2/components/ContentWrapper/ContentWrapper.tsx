import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type ContentWrapperProps = {
	children: ReactNode;
	centerAligned?: boolean;
	axisDirection?: 'vertical' | 'horizontal';
	noTopPadding?: boolean;
	noBottomPadding?: boolean;
	sidePadding?: string;
	isFullWidth?: boolean;
};

export const ContentWrapper = ( {
	children,
	centerAligned,
	axisDirection = 'vertical',
	noTopPadding = false,
	noBottomPadding = false,
	sidePadding,
	isFullWidth = false,
}: ContentWrapperProps ) => {
	const style =
		sidePadding !== undefined ? { '--content-wrapper-side-padding': sidePadding } : undefined;

	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', `axis-${ axisDirection }`, {
				'center-aligned': centerAligned,
				'no-top-padding': noTopPadding,
				'no-bottom-padding': noBottomPadding,
				'has-custom-side-padding': sidePadding !== undefined,
				'is-full-width': isFullWidth,
			} ) }
			style={ style as React.CSSProperties }
		>
			{ children }
		</div>
	);
};
