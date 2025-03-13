import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { StepContainerV2InternalProvider } from '../../contexts/StepContainerV2InternalContext';

import './style.scss';

interface StepContainerV2Props {
	className?: string;
	topBar?: ReactNode;
	heading?: ReactNode;
	stickyBottomBar?: ReactNode;
	width?: 'standard' | 'wide' | 'full';
	verticalAlign?: 'top' | 'center';
	isLargeViewport?: boolean;
	children: ReactNode;
}

export const StepContainerV2 = ( {
	className,
	topBar,
	heading,
	stickyBottomBar,
	width = 'standard',
	verticalAlign = 'top',
	isLargeViewport: externalIsLargeViewport,
	children,
}: StepContainerV2Props ) => {
	const internalIsLargeViewport = useViewportMatch( 'medium', '>=' );

	const isLargeViewport = externalIsLargeViewport ?? internalIsLargeViewport;

	return (
		<StepContainerV2InternalProvider value={ { isLargeViewport } }>
			<div className={ clsx( 'step-container-v2', { 'large-viewport': isLargeViewport } ) }>
				{ topBar }
				{ heading }
				<div
					className={ clsx( 'step-container-v2__content', className, {
						'large-viewport': isLargeViewport,
						wide: width === 'wide',
						full: width === 'full',
						'vertical-align-center': verticalAlign === 'center',
					} ) }
				>
					{ children }
				</div>
				{ ! isLargeViewport && stickyBottomBar }
			</div>
		</StepContainerV2InternalProvider>
	);
};
