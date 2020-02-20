/**
 * Internal dependencies
 */

import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/invites-create-validation';

const InvitesCreateValidationStore = createReducerStore( reducer, initialState );

InvitesCreateValidationStore.getSuccess = ( siteId, role ) =>
	InvitesCreateValidationStore.get().getIn( [ 'success', siteId, role ] );
InvitesCreateValidationStore.getErrors = ( siteId, role ) =>
	InvitesCreateValidationStore.get().getIn( [ 'errors', siteId, role ] );

export default InvitesCreateValidationStore;
