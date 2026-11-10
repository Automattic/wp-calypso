import { lazyWithRetry } from '../../utils/lazy-component';

// The pickers carry the block-editor preview stack, so each fetches its chunk when it first
// renders, and other chats never download it.

export const ButtonPicker = lazyWithRetry(
	() => import( /* webpackChunkName: "am-button-picker" */ '../button-picker' )
);

export const ColorPicker = lazyWithRetry(
	() => import( /* webpackChunkName: "am-color-picker" */ '../color-picker' )
);

export const FontPicker = lazyWithRetry(
	() => import( /* webpackChunkName: "am-font-picker" */ '../font-picker' )
);
