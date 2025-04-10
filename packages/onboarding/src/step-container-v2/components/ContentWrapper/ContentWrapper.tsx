import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	centerAligned,
	hasPadding = true,
}: {
	children: ReactNode;
	centerAligned?: boolean;
	hasPadding?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', {
				'center-aligned': centerAligned,
				padding: hasPadding,
			} ) }
		>
			{ children }
		</div>
	);
};
