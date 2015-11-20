/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/list-invites';

const InvitesStore = createReducerStore( reducer, initialState );

InvitesStore.getInvites = ( siteId ) => InvitesStore.get().getIn( [ 'list', siteId ] );

export default InvitesStore;
