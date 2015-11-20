/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from '../reducers/themes';

const ThemesStore = createReducerStore( reducer, initialState );

ThemesStore.getThemes = () => ThemesStore.get().get( 'themes' ).toJS();

ThemesStore.getById = ( id ) => {
	const theme = ThemesStore.get().getIn( [ 'themes', id ] );
	return theme ? theme.toJS() : undefined;
};

export default ThemesStore;
