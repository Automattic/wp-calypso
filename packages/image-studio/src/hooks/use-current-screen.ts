/**
 * Lightweight version of the Big Sky `useCurrentScreen` hook.
 *
 * Provides enough information for Image Studio to detect whether it is
 * running inside the post or site editor so that suggestions behave correctly.
 */

import { usePrevious } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

type ScreenContext = {
	screen?: string;
	postId?: number;
	previousPostId?: number;
};

declare global {
	interface Window {
		bigSkyInitialState?: {
			currentScreen?: ScreenContext;
		};
	}
}

function getCurrentScreenContext(): ScreenContext | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	if ( window.bigSkyInitialState?.currentScreen ) {
		return window.bigSkyInitialState.currentScreen;
	}

	// Fallback based on WordPress globals
	const pagenow = ( window as unknown as { pagenow?: string } ).pagenow;

	if ( pagenow ) {
		return { screen: pagenow };
	}

	return null;
}

export default function useCurrentScreen() {
	const currentScreen = getCurrentScreenContext();
	const isSiteEditor =
		currentScreen?.screen === 'site-editor' ||
		( currentScreen?.screen ?? '' ).includes( 'site-editor' );
	const isPostEditor =
		currentScreen?.screen === 'post' ||
		currentScreen?.screen === 'block-editor' ||
		( currentScreen?.screen ?? '' ).includes( 'post' );
	const screen = currentScreen?.screen ?? '';

	const postType = useSelect( ( select ) => select( editorStore )?.getCurrentPostType?.(), [] );
	const postId = useSelect( ( select ) => select( editorStore )?.getCurrentPostId?.(), [] );
	const previousPostId = usePrevious( postId );

	return {
		isSiteEditor,
		isPostEditor,
		screen,
		postType: postType ?? '',
		isPagePostType: postType === 'page',
		currentScreen,
		postId: postId ?? null,
		previousPostId: previousPostId ?? null,
	};
}
