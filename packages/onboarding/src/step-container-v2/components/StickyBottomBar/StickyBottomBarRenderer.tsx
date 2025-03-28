import { useContext } from 'react';
import { StepContainerV2Context, ContentProp } from '../StepContainerV2/context';

export const StickyBottomBarRenderer = ( {
	stickyBottomBar,
}: {
	stickyBottomBar?: ContentProp;
} ) => {
	const context = useContext( StepContainerV2Context );

	if ( typeof stickyBottomBar === 'function' ) {
		return stickyBottomBar( context );
	}

	return context.isSmallViewport ? null : stickyBottomBar;
};
