/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState, getCurrentTheme } from '../reducers/current-theme';

const CurrentThemeStore = createReducerStore( reducer, initialState );

CurrentThemeStore.getCurrentTheme = ( siteId ) => getCurrentTheme( CurrentThemeStore.get(), siteId );
CurrentThemeStore.isActivating = () => CurrentThemeStore.get().get( 'isActivating' );
CurrentThemeStore.hasActivated = () => CurrentThemeStore.get().get( 'hasActivated' );

export default CurrentThemeStore;

