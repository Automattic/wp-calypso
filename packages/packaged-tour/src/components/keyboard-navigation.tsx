/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import * as React from 'react';
/**
 * Internal dependencies
 */
import useFocusHandler from '../hooks/use-focus-handler';
import useFocusTrap from '../hooks/use-focus-trap';
import useKeydownHandler from '../hooks/use-keydown-handler';

interface Props {
	onMinimize: () => void;
	onDismiss: ( target: string ) => () => void;
	onNextStepProgression: () => void;
	onPreviousStepProgression: () => void;
	tourContainerElement: HTMLElement | null;
	isMinimized: boolean;
}

const KeyboardNavigation: React.FunctionComponent< Props > = ( {
	onMinimize,
	onDismiss,
	onNextStepProgression,
	onPreviousStepProgression,
	tourContainerElement,
	isMinimized,
} ) => {
	function ExpandedTourNav() {
		useKeydownHandler( {
			onEscape: onMinimize,
			onArrowRight: onNextStepProgression,
			onArrowLeft: onPreviousStepProgression,
		} );
		useFocusTrap( tourContainerElement );

		return null;
	}

	function MinimizedTourNav() {
		useKeydownHandler( { onEscape: onDismiss( 'esc-key-minimized' ) } );

		return null;
	}

	const isTourFocused = useFocusHandler( tourContainerElement );

	if ( ! isTourFocused ) {
		return null;
	}

	return isMinimized ? <MinimizedTourNav /> : <ExpandedTourNav />;
};

export default KeyboardNavigation;
