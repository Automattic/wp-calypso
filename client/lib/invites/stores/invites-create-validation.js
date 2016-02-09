/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/invites-create-validation';

const InvitesCreateValidationStore = createReducerStore( reducer, initialState );

InvitesCreateValidationStore.getSuccess = ( siteId ) => InvitesCreateValidationStore.get().getIn( [ 'success', siteId ] );
InvitesCreateValidationStore.getErrors = ( siteId ) => InvitesCreateValidationStore.get().getIn( [ 'errors', siteId ] );

export default InvitesCreateValidationStore;
