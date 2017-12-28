/** @format */

/**
 * Internal dependencies
 */

import { createReducerStore } from 'client/lib/store';
import { reducer, initialState } from 'client/lib/invites/reducers/invites-list';

const InvitesStore = createReducerStore( reducer, initialState );

InvitesStore.getInvites = siteId => InvitesStore.get().getIn( [ 'list', siteId ] );

export default InvitesStore;
