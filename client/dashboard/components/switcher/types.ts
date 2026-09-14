import type { ReactNode } from 'react';

export type RenderItemProps< T > = {
	item: T;
	context: 'dropdown' | 'list';
};

export type RenderItem< T > = ( props: RenderItemProps< T > ) => ReactNode;

/**
 * Describes the placeholder rows shown before the items arrive. Set `hasMedia`
 * and `hasDescription` to match what the eventual loaded items look like.
 */
export type SwitcherLoadingState = {
	/**
	 * A hint of the number of eventual items to expect. This way the loading
	 * state will be the same height as the eventual loaded state.
	 */
	itemCount: number;
	hasMedia: boolean;
	hasDescription: boolean;
	mediaSize?: number;
	spacing?: number;
};
