import clsx from 'clsx';
import { ReactNode, Children, isValidElement, type CSSProperties } from 'react';

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
	const childrenCount = Children.toArray( children ).filter( isValidElement ).length;

	return (
		<div
			className={ clsx( 'step-container-v2__content-wrapper', maxWidth, {
				'center-aligned': centerAligned,
				padding: hasPadding,
			} ) }
			style={ { gridTemplateRows: `repeat( ${ childrenCount }, min-content )` } }
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
