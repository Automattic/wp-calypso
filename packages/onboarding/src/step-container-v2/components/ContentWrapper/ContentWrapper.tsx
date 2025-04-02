import clsx from 'clsx';
import { ReactNode, Children, isValidElement } from 'react';

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
