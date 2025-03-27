import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface StepContainerV2InternalContextType {
	isSmallViewport: boolean;
	isLargeViewport: boolean;
}

export type ContentProp< T = ReactNode > =
	| ( ( context: StepContainerV2InternalContextType ) => T )
	| T;

export interface StepContainerV2Props {
	className?: string;
	topBar?: ContentProp;
	heading?: ContentProp;
	footer?: ContentProp;
	stickyBottomBar?: ContentProp;
	width?: 'standard' | 'wide' | 'full';
	verticalAlign?: 'top' | 'center-on-small' | 'center';
	hasContentPadding?: ContentProp< boolean >;
	children?: ContentProp;
}

export const StepContainerV2 = ( {
	className,
	topBar,
	heading,
	footer,
	stickyBottomBar,
	width = 'standard',
	verticalAlign = 'top',
	hasContentPadding = true,
	children,
}: StepContainerV2Props ) => {
	const isSmallViewport = useViewportMatch( 'small', '>=' );
	const isLargeViewport = useViewportMatch( 'large', '>=' );

	const stepContainerContextValue = { isSmallViewport, isLargeViewport };

	const topBarContent = typeof topBar === 'function' ? topBar( stepContainerContextValue ) : topBar;

	const headingContent =
		typeof heading === 'function' ? heading( stepContainerContextValue ) : heading;
	const footerContent = typeof footer === 'function' ? footer( stepContainerContextValue ) : footer;

	const content = typeof children === 'function' ? children( stepContainerContextValue ) : children;

	const stickyBottomBarContent =
		typeof stickyBottomBar === 'function'
			? stickyBottomBar( stepContainerContextValue )
			: ! isSmallViewport && stickyBottomBar;

	const hasContentPaddingResult =
		typeof hasContentPadding === 'function'
			? hasContentPadding( stepContainerContextValue )
			: hasContentPadding;

	return (
		<div className="step-container-v2">
			{ topBarContent }
			<div
				className={ clsx(
					'step-container-v2__content-wrapper',
					verticalAlign !== 'top' &&
						`step-container-v2__content-wrapper--aligned-${ verticalAlign }`,
					hasContentPaddingResult && 'step-container-v2__content-wrapper--padding'
				) }
			>
				{ headingContent }
				<div
					className={ clsx( 'step-container-v2__content', className, {
						wide: width === 'wide',
						full: width === 'full',
					} ) }
				>
					{ content }
				</div>
				{ footerContent && (
					<div
						className={ clsx( 'step-container-v2__footer', {
							wide: width === 'wide',
							full: width === 'full',
						} ) }
					>
						{ footerContent }
					</div>
				) }
			</div>
			{ stickyBottomBarContent }
		</div>
	);
};
