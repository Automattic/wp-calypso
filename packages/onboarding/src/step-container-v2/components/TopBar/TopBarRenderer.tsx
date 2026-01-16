import { useContext, useLayoutEffect, useRef } from 'react';
import {
	StepContainerV2Context,
	type ContentProp,
	type StepContainerV2InternalContextType,
} from '../StepContainerV2/context';

export const renderTopBar = (
	topBar: ContentProp,
	context: Pick< StepContainerV2InternalContextType, 'isSmallViewport' | 'isLargeViewport' >
) => {
	return typeof topBar === 'function' ? topBar( context ) : topBar;
};

export const TopBarRenderer = ( { topBar }: { topBar?: ContentProp } ) => {
	const context = useContext( StepContainerV2Context );
	const { setTopBarHeight } = context;

	const topBarRef = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		const resizeObserver = new ResizeObserver( ( [ entry ] ) => {
			if ( entry ) {
				setTopBarHeight( `${ entry.contentRect.height }px` );
			}
		} );

		if ( topBarRef.current ) {
			setTopBarHeight( `${ topBarRef.current.clientHeight }px` );
			resizeObserver.observe( topBarRef.current );
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [ setTopBarHeight ] );

	return (
		<div ref={ topBarRef } className="step-container-v2__top-bar-wrapper">
			{ renderTopBar( topBar, context ) }
		</div>
	);
};
