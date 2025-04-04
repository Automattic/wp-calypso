import clsx from 'clsx';
import type { ReactNode, CSSProperties } from 'react';

import './style.scss';

type MaxWidth = 'wide' | 'huge' | 'xhuge';

const ContentWrapper = ( {
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

ContentWrapper.Row = ( { columns, children }: { columns: number; children: ReactNode } ) => {
	return (
		<div
			className="step-container-v2__content-wrapper-row"
			style={ { '--columns': columns } as CSSProperties }
		>
			{ children }
		</div>
	);
};

export { ContentWrapper };
