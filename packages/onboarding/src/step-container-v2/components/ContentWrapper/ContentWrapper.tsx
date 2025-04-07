import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type MaxWidth = 'wide' | 'huge' | 'xhuge';

export const ContentWrapper = ( {
	children,
	maxWidth = 'wide',
	centerAligned,
	hasPadding = true,
}: {
	children: ReactNode;
	maxWidth?: MaxWidth;
	centerAligned?: boolean;
	hasPadding?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', maxWidth, {
				'center-aligned': centerAligned,
				padding: hasPadding,
			} ) }
		>
			{ children }
		</div>
	);
};
