import { useContext, useRef, useLayoutEffect } from 'react';
import { StepContainerV2Context, ContentProp } from '../StepContainerV2/context';

export const StickyBottomBarRenderer = ( {
	stickyBottomBar,
}: {
	stickyBottomBar?: ContentProp;
} ) => {
	const context = useContext( StepContainerV2Context );
	const { setStickyBottomBarHeight } = context;

	const stickyBottomBarRef = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		const resizeObserver = new ResizeObserver( ( [ entry ] ) => {
			if ( entry ) {
				setStickyBottomBarHeight( entry.contentRect.height );
			}
		} );

		if ( stickyBottomBarRef.current ) {
			setStickyBottomBarHeight( stickyBottomBarRef.current.clientHeight );
			resizeObserver.observe( stickyBottomBarRef.current );
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [ setStickyBottomBarHeight ] );

	const content =
		typeof stickyBottomBar === 'function'
			? stickyBottomBar( context )
			: ! context.isSmallViewport && stickyBottomBar;

	return (
		<div className="step-container-v2__sticky-bottom-bar-wrapper" ref={ stickyBottomBarRef }>
			{ content }
		</div>
	);
};
