/** @format */
/**
 * Internal dependencies
 */

import { createReducerStore } from 'client/lib/store';
import { reducer, initialState } from 'client/lib/invites/reducers/invites-sent';

const InvitesSentStore = createReducerStore( reducer, initialState );

InvitesSentStore.getSuccess = formId => InvitesSentStore.get().successes[ formId ];
InvitesSentStore.getErrors = formId => InvitesSentStore.get().errors[ formId ];

export default InvitesSentStore;
