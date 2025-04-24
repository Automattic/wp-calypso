import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export const ContentWrapper = ( {
	children,
	centerAligned,
}: {
	children: ReactNode;
	centerAligned?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', {
				'center-aligned': centerAligned,
			} ) }
		>
			{ children }
		</div>
	);
};
