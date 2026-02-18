import {
	store as blockEditorStore,
	// @ts-expect-error - Typings missing
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useCallback, useRef } from '@wordpress/element';

interface InitialBlockSelectorProps {
	editorClass: string;
	focusOnMount: boolean;
	onBlockSelect: () => void;
}

/**
 * Component to select the last block on initial load.
 *
 * NOTE: Must be rendered inside BlockEditorProvider to access the correct store context.
 */
export default function InitialBlockSelector( {
	editorClass,
	focusOnMount,
	onBlockSelect,
}: InitialBlockSelectorProps ): null {
	const { selectBlock } = useDispatch( blockEditorStore );
	const storeBlocks = useSelect( ( select ) => select( blockEditorStore ).getBlocks(), [] );
	const hasInitialized = useRef( false );

	/**
	 * Waits for the selected block to be available in the DOM and then overrides the "scrollIntoView" function to prevent scrolling on initial load.
	 *
	 * As of v15.12 Gutenberg is using "useScrollIntoView" hook to scroll the selected block into view even when `initialPosition` of the block is set to "null" (no focus).
	 * This is bringing the block into the view when the user doesn't want it.
	 */
	const waitForSelectedElementAndOverrideScroll = useCallback( () => {
		// If we are focusing on mount then keep the default behavior of scrolling.
		if ( focusOnMount ) {
			return;
		}

		const blockSelector = '.wp-block.is-selected';
		const editorIframe = document.querySelector(
			`.${ editorClass } iframe`
		) as HTMLIFrameElement | null;

		if ( ! editorIframe?.contentDocument ) {
			return;
		}

		let selectedElement: HTMLElement | null | undefined;
		let originalScrollIntoView: ( arg?: boolean | ScrollIntoViewOptions ) => void;

		const interval = setInterval( () => {
			selectedElement = editorIframe?.contentDocument?.querySelector( blockSelector );

			if ( ! selectedElement ) {
				return;
			}

			// Store original and replace with empty function.
			originalScrollIntoView = selectedElement.scrollIntoView;
			selectedElement.scrollIntoView = () => {};
			clearInterval( interval );
		}, 50 );

		// Clear interval and restore the original scrollIntoView to prevent breaking any future calls.
		setTimeout( () => {
			clearInterval( interval );

			// Restore original scrollIntoView if it was replaced
			if ( selectedElement && originalScrollIntoView ) {
				selectedElement.scrollIntoView = originalScrollIntoView;
			}
		}, 5000 );
	}, [ editorClass, focusOnMount ] );

	useEffect( () => {
		// To ensure we only run this useEffect once.
		if ( hasInitialized.current ) {
			return;
		}

		const lastBlock = storeBlocks[ storeBlocks.length - 1 ];
		if ( ! lastBlock ) {
			return;
		}

		hasInitialized.current = true;

		selectBlock( lastBlock.clientId, focusOnMount ? 0 : null ).then( () => {
			waitForSelectedElementAndOverrideScroll();
			onBlockSelect();
		} );
	}, [
		selectBlock,
		storeBlocks,
		onBlockSelect,
		focusOnMount,
		waitForSelectedElementAndOverrideScroll,
	] );

	return null;
}
