/**
 * Internal dependencies
 */

import { createReducerStore } from 'lib/store';
import { reducer, initialState } from 'lib/invites/reducers/invites-sent';

const InvitesSentStore = createReducerStore( reducer, initialState );

InvitesSentStore.getSuccess = ( formId ) => InvitesSentStore.get().successes[ formId ];
InvitesSentStore.getErrors = ( formId ) => InvitesSentStore.get().errors[ formId ];

export default InvitesSentStore;
