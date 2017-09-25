/**
 * Internal dependencies
 */
import { reducer, initialState } from 'lib/invites/reducers/invites-accept-validation';
import { createReducerStore } from 'lib/store';

const InvitesAcceptValidationStore = createReducerStore( reducer, initialState );

InvitesAcceptValidationStore.getInvite = ( siteId, inviteKey ) => InvitesAcceptValidationStore.get().getIn( [ 'list', siteId, inviteKey ] );
InvitesAcceptValidationStore.getInviteError = ( siteId, inviteKey ) => InvitesAcceptValidationStore.get().getIn( [ 'errors', siteId, inviteKey ] );

export default InvitesAcceptValidationStore;
