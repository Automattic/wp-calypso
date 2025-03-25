import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
	footer?: ReactNode;
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
	footer,
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

	const topBarRef = useRef< HTMLDivElement >( null );
	const [ topBarHeight, setTopBarHeight ] = useState( 0 );

	const stickyBottomBarRef = useRef< HTMLDivElement >( null );
	const [ stickyBottomBarHeight, setStickyBottomBarHeight ] = useState( 0 );

	useLayoutEffect( () => {
		const observer = new ResizeObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				const element = entry.target;

				if ( element === topBarRef.current ) {
					setTopBarHeight( entry.contentRect.height );
				} else if ( element === stickyBottomBarRef.current ) {
					setStickyBottomBarHeight( entry.contentRect.height );
				}
			} );
		} );

		if ( topBarRef.current ) {
			observer.observe( topBarRef.current );
		}
		if ( stickyBottomBarRef.current ) {
			observer.observe( stickyBottomBarRef.current );
		}

		return () => {
			observer.disconnect();
		};
	}, [] );

	return (
		<StepContainerV2InternalProvider value={ stepContainerContextValue }>
			<div
				className={ clsx( 'step-container-v2', {
					'medium-viewport': isMediumViewport,
					'large-viewport': isLargeViewport,
				} ) }
				style={ {
					// @ts-expect-error -- These are valid CSS variables.
					'--step-container-v2-top-bar-height': `${ topBarHeight ?? 0 }px`,
					'--step-container-v2-sticky-bottom-bar-height': `${ stickyBottomBarHeight ?? 0 }px`,
				} }
			>
				{ topBar && <div ref={ topBarRef }>{ topBar }</div> }
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
					{ footer && (
						<div
							className={ clsx( 'step-container-v2__footer', {
								wide: width === 'wide',
								full: width === 'full',
							} ) }
						>
							{ footer }
						</div>
					) }
				</div>
				{ ! isMediumViewport && stickyBottomBar && (
					<div ref={ stickyBottomBarRef }>{ stickyBottomBar }</div>
				) }
			</div>
		</StepContainerV2InternalProvider>
	);
};
