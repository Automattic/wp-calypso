/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from '../reducers/themes-last-event';

const LastEventStore = createReducerStore( reducer, initialState );

LastEventStore.getSearch = () => LastEventStore.get().get( 'search' );
LastEventStore.getActivate = () => LastEventStore.get().get( 'activate' ).toObject();

export default LastEventStore;
