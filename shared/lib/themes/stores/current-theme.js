/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from '../reducers/current-theme';

const CurrentThemeStore = createReducerStore( reducer, initialState );

CurrentThemeStore.getCurrentTheme = ( siteId ) => CurrentThemeStore.get().get( 'currentThemes' ).get( siteId );
CurrentThemeStore.isActivating = () => CurrentThemeStore.get().get( 'isActivating' );
CurrentThemeStore.hasActivated = () => CurrentThemeStore.get().get( 'hasActivated' );

export default CurrentThemeStore;

