import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { ReactNode, useMemo } from 'react';
import {
	StepContainerV2InternalProvider,
	type StepContainerV2InternalContextType,
} from '../../contexts/StepContainerV2InternalContext';

import './style.scss';

export type StepContainerV2ContentProp =
	| ( ( context: StepContainerV2InternalContextType ) => ReactNode )
	| ReactNode;

export interface StepContainerV2Props {
	className?: string;
	topBar?: ReactNode;
	heading?: ReactNode;
	stickyBottomBar?: ReactNode;
	width?: 'standard' | 'wide' | 'full';
	verticalAlign?: 'top' | 'center';
	isMediumViewport?: boolean;
	isLargeViewport?: boolean;
	hasContentPadding?: boolean;
	children?: StepContainerV2ContentProp;
}

export const StepContainerV2 = ( {
	className,
	topBar,
	heading,
	stickyBottomBar,
	width = 'standard',
	verticalAlign = 'top',
	isMediumViewport: externalIsMediumViewport,
	isLargeViewport: externalIsLargeViewport,
	hasContentPadding = true,
	children,
}: StepContainerV2Props ) => {
	const internalIsMediumViewport = useViewportMatch( 'small', '>=' );
	const isMediumViewport = externalIsMediumViewport ?? internalIsMediumViewport;

	const internalIsLargeViewport = useViewportMatch( 'medium', '>=' );
	const isLargeViewport = externalIsLargeViewport ?? internalIsLargeViewport;

	const stepContainerContextValue = useMemo(
		() => ( { isMediumViewport, isLargeViewport } ),
		[ isMediumViewport, isLargeViewport ]
	);

	return (
		<StepContainerV2InternalProvider value={ stepContainerContextValue }>
			<div
				className={ clsx( 'step-container-v2', {
					'medium-viewport': isMediumViewport,
					'large-viewport': isLargeViewport,
				} ) }
			>
				{ topBar }
				<div
					className={ clsx( 'step-container-v2__content-wrapper', {
						'vertical-align-center': verticalAlign === 'center',
						padding: hasContentPadding,
					} ) }
				>
					{ heading }
					<div
						className={ clsx( 'step-container-v2__content', className, {
							wide: width === 'wide',
							full: width === 'full',
						} ) }
					>
						{ typeof children === 'function' ? children( stepContainerContextValue ) : children }
					</div>
				</div>
				{ ! isMediumViewport && stickyBottomBar }
			</div>
		</StepContainerV2InternalProvider>
	);
};
