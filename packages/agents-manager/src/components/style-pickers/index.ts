import lazyComponent from '../../utils/lazy-component';

// The pickers carry the block-editor preview stack, so each fetches its chunk when it first
// renders, and other chats never download it.

export const ButtonPicker = lazyComponent(
	() => import( /* webpackChunkName: "am-button-picker" */ '../button-picker' )
);

export const ColorPicker = lazyComponent(
	() => import( /* webpackChunkName: "am-color-picker" */ '../color-picker' )
);

export const FontPicker = lazyComponent(
	() => import( /* webpackChunkName: "am-font-picker" */ '../font-picker' )
);
