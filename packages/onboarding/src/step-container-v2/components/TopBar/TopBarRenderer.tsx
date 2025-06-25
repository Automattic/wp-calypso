import { useContext, useLayoutEffect, useRef } from 'react';
import { StepContainerV2Context, ContentProp } from '../StepContainerV2/context';

export const TopBarRenderer = ( { topBar }: { topBar?: ContentProp } ) => {
	const context = useContext( StepContainerV2Context );
	const { setTopBarHeight } = context;

	const topBarRef = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		const resizeObserver = new ResizeObserver( ( [ entry ] ) => {
			if ( entry ) {
				setTopBarHeight( entry.contentRect.height );
			}
		} );

		if ( topBarRef.current ) {
			setTopBarHeight( topBarRef.current.clientHeight );
			resizeObserver.observe( topBarRef.current );
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [ setTopBarHeight ] );

	const topBarContent = typeof topBar === 'function' ? topBar( context ) : topBar;

	return (
		<div ref={ topBarRef } className="step-container-v2__top-bar-wrapper">
			{ topBarContent }
		</div>
	);
};
