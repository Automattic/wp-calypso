/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import ThemesLastQueryStore from './themes-last-query';
import { reducer, initialState, getQueryParams } from '../reducers/themes-list';

const ThemesListStore = createReducerStore( reducer, initialState );

ThemesListStore.getThemesList = () => ThemesListStore.get().get( 'list' );
ThemesListStore.getQueryParams = () => getQueryParams( ThemesListStore.get() );
ThemesListStore.isLastPage = () => ThemesLastQueryStore.isJetpack() || ThemesListStore.get().getIn( [ 'queryState', 'isLastPage' ] );
ThemesListStore.isFetchingNextPage = () => ThemesListStore.get().getIn( [ 'queryState', 'isFetchingNextPage' ] );

export default ThemesListStore;
