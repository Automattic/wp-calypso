import isAmAbilitiesDisabled from './is-am-abilities-disabled';
import lazyComponent from './lazy-component';
import type { GetChatComponent } from './load-external-providers';
import type { ShowComponentType } from '../abilities/show-component';

// Full Agents Manager owns these structural editor components. Keeping their
// lazy imports outside the shared converter keeps them out of writing-only graphs.
const AM_COMPONENTS: Record< ShowComponentType, React.ComponentType > = {
	'button-picker': lazyComponent(
		() => import( /* webpackChunkName: "am-button-picker" */ '../components/button-picker' )
	),
	'color-picker': lazyComponent(
		() => import( /* webpackChunkName: "am-color-picker" */ '../components/color-picker' )
	),
	'font-picker': lazyComponent(
		() => import( /* webpackChunkName: "am-font-picker" */ '../components/font-picker' )
	),
};

export const getAmChatComponent: GetChatComponent = ( type ) => {
	if ( isAmAbilitiesDisabled() ) {
		return null;
	}

	// Own-property check prevents names such as `toString` from resolving to
	// Object.prototype members.
	return Object.hasOwn( AM_COMPONENTS, type )
		? ( AM_COMPONENTS[ type as ShowComponentType ] as React.ComponentType< unknown > )
		: null;
};
