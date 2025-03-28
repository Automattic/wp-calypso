import { useViewportMatch } from '@wordpress/compose';
import { ContentProp, StepContainerV2Context } from './context';
import './style.scss';

export const StepContainerV2 = ( { children }: { children: ContentProp } ) => {
	const isSmallViewport = useViewportMatch( 'small', '>=' );
	const isLargeViewport = useViewportMatch( 'large', '>=' );

	const stepContainerContextValue = { isSmallViewport, isLargeViewport };

	const content = typeof children === 'function' ? children( stepContainerContextValue ) : children;

	return (
		<StepContainerV2Context.Provider value={ stepContainerContextValue }>
			<div className="step-container-v2">{ content }</div>
		</StepContainerV2Context.Provider>
	);
};
