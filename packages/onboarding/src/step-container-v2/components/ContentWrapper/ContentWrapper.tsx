import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Width =
	| 'wide'
	| 'huge'
	| 'huge-plus' // Non-standard width introduced for plans step
	| 'xhuge';

export const ContentWrapper = ( {
	children,
	width = 'wide',
	centerAligned,
	hasPadding = true,
}: {
	children: ReactNode;
	width?: Width;
	centerAligned?: boolean;
	hasPadding?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', width, {
				'center-aligned': centerAligned,
				padding: hasPadding,
			} ) }
		>
			{ children }
		</div>
	);
};
