/**
 * Internal dependencies
 */
import { reducer, initialState } from 'lib/invites/reducers/invites-list';
import { createReducerStore } from 'lib/store';

const InvitesStore = createReducerStore( reducer, initialState );

InvitesStore.getInvites = ( siteId ) => InvitesStore.get().getIn( [ 'list', siteId ] );

export default InvitesStore;
