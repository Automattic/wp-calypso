import { useContext } from 'react';
import { StepContainerV2Context, ContentProp } from '../StepContainerV2/context';

export const TopBarRenderer = ( { topBar }: { topBar?: ContentProp } ) => {
	const context = useContext( StepContainerV2Context );
	const topBarContent = typeof topBar === 'function' ? topBar( context ) : topBar;

	if ( ! topBarContent ) {
		return null;
	}

	return <div style={ { width: '100%' } }>{ topBarContent }</div>;
};
