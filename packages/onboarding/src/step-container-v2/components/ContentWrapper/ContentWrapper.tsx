import clsx from 'clsx';
import styles from './style.module.scss';
import type { ReactNode } from 'react';

export const ContentWrapper = ( {
	children,
	centerAligned,
}: {
	children: ReactNode;
	centerAligned?: boolean;
} ) => {
	return (
		<div
			className={ clsx( styles[ 'step-container-v2__content-wrapper' ], {
				[ styles[ 'center-aligned' ] ]: centerAligned,
			} ) }
		>
			{ children }
		</div>
	);
};
