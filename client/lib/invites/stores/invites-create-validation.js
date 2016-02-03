/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/invites-create-validation';

const InvitesCreateValidationStore = createReducerStore( reducer, initialState );

InvitesCreateValidationStore.getSuccess = ( siteId, usernamesOrEmails ) => InvitesCreateValidationStore.get().getIn( [ 'success', siteId, usernamesOrEmails ] );
InvitesCreateValidationStore.getErrors = ( siteId, usernamesOrEmails ) => InvitesCreateValidationStore.get().getIn( [ 'errors', siteId, usernamesOrEmails ] );

export default InvitesCreateValidationStore;
