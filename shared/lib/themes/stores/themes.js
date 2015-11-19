/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState, getThemeById } from '../reducers/themes';

const ThemesStore = createReducerStore( reducer, initialState );

ThemesStore.getThemes = () => ThemesStore.get().get( 'themes' ).toJS();
ThemesStore.getById = ( id ) => getThemeById( ThemesStore.get(), id );

export default ThemesStore;
