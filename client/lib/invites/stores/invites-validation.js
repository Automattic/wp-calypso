/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/invites-validation';

const InvitesValidationStore = createReducerStore( reducer, initialState );

InvitesValidationStore.getInvite = ( siteId, inviteKey ) => InvitesValidationStore.get().getIn( [ 'list', siteId, inviteKey ] );
InvitesValidationStore.getInviteError = ( siteId, inviteKey ) => InvitesValidationStore.get().getIn( [ 'errors', siteId, inviteKey ] );

export default InvitesValidationStore;
