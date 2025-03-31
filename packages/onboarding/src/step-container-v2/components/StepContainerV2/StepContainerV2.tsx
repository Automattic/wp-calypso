import { useViewportMatch } from '@wordpress/compose';
import { useMemo, useState } from 'react';
import { ContentProp, StepContainerV2Context } from './context';
import './style.scss';

export const StepContainerV2 = ( { children }: { children: ContentProp } ) => {
	const isSmallViewport = useViewportMatch( 'small', '>=' );
	const isLargeViewport = useViewportMatch( 'large', '>=' );

	const [ topBarHeight, setTopBarHeight ] = useState( 0 );
	const [ stickyBottomBarHeight, setStickyBottomBarHeight ] = useState( 0 );

	const stepContainerContextValue = useMemo(
		() => ( {
			isSmallViewport,
			isLargeViewport,
			topBarHeight,
			setTopBarHeight,
			stickyBottomBarHeight,
			setStickyBottomBarHeight,
		} ),
		[
			isSmallViewport,
			isLargeViewport,
			topBarHeight,
			setTopBarHeight,
			stickyBottomBarHeight,
			setStickyBottomBarHeight,
		]
	);

	const content = typeof children === 'function' ? children( stepContainerContextValue ) : children;

	return (
		<StepContainerV2Context.Provider value={ stepContainerContextValue }>
			<div
				className="step-container-v2"
				style={
					{
						'--step-container-v2-top-bar-height': `${ topBarHeight }px`,
						'--step-container-v2-sticky-bottom-bar-height': `${ stickyBottomBarHeight }px`,
					} as React.CSSProperties
				}
			>
				{ content }
			</div>
		</StepContainerV2Context.Provider>
	);
};
