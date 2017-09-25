/**
 * Internal dependencies
 */
import { reducer, initialState } from 'lib/invites/reducers/invites-sent';
import { createReducerStore } from 'lib/store';

const InvitesSentStore = createReducerStore( reducer, initialState );

InvitesSentStore.getSuccess = ( formId ) => InvitesSentStore.get().getIn( [ 'success', formId ] );
InvitesSentStore.getErrors = ( formId ) => InvitesSentStore.get().getIn( [ 'error', formId ] );

export default InvitesSentStore;
