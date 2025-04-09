import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

type MaxWidth = 'default' | 'large';

export const ContentWrapper = ( {
	children,
	maxWidth = 'default',
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
			className={ clsx(
				'step-container-v2__content-wrapper',
				`step-container-v2__content-wrapper--max-width-${ maxWidth }`,
				{
					'center-aligned': centerAligned,
					padding: hasPadding,
				}
			) }
		>
			{ children }
		</div>
	);
};
