import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	width,
	centerAligned,
	hasPadding = true,
}: {
	children: ReactNode;
	width?: 'wide' | 'full';
	centerAligned?: boolean;
	hasPadding?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', {
				wide: width === 'wide',
				full: width === 'full',
				'center-aligned': centerAligned,
				padding: hasPadding,
			} ) }
		>
			{ children }
		</div>
	);
};
