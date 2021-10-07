/**
 * External dependencies
 */
import * as React from 'react';
/**
 * Internal dependencies
 */
import useFocusHandler from './hooks/use-focus-handler';
import useKeydownHandler from './hooks/use-keydown-handler';

interface Props {
	onMinimize: () => void;
	onDismiss: ( target: string ) => () => void;
	onNextStepProgression: () => void;
	onPreviousStepProgression: () => void;
	tourContainerRef: React.MutableRefObject< null | HTMLElement >;
	isMinimized: boolean;
}

const KeyboardNavigation: React.FunctionComponent< Props > = ( {
	onMinimize,
	onDismiss,
	onNextStepProgression,
	onPreviousStepProgression,
	tourContainerRef,
	isMinimized,
} ) => {
	function ExpandedTourNav() {
		useKeydownHandler( {
			onEscape: onMinimize,
			onArrowRight: onNextStepProgression,
			onArrowLeft: onPreviousStepProgression,
		} );
		return null;
	}

	function MinimizedTourNav() {
		useKeydownHandler( { onEscape: onDismiss( 'esc-key-minimized' ) } );
		return null;
	}

	const isTourFocused = useFocusHandler( tourContainerRef );

	if ( ! isTourFocused ) {
		return null;
	}

	return isMinimized ? <MinimizedTourNav /> : <ExpandedTourNav />;
};

export default KeyboardNavigation;
