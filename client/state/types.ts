import { SiteDetails } from '@automattic/data-stores';
import type { CountriesState } from './countries/types';
import type { BillingTransactionsState } from 'calypso/state/billing-transactions/types';
import type { IMarketplaceState } from 'calypso/state/marketplace/types';
import type { IMembershipsState } from 'calypso/state/memberships/reducer';
import type { IPluginsState } from 'calypso/state/plugins/reducer';
import type { ThunkDispatch } from 'redux-thunk';

/**
 * This global Redux app state.
 *
 * This is currently incomplete and should be completed as each state slice
 * becomes typed.
 *
 * Each slice is registered dynamically by calling the `registerReducer()`
 * function so please mark each slice as optional as it may not be defined when
 * its selector is called (eg: in tests which do not implement dynamic
 * reducers).
 */
export interface IAppState {
	plugins?: IPluginsState;
	marketplace?: IMarketplaceState;
	memberships?: IMembershipsState;
	countries?: CountriesState;
	billingTransactions?: BillingTransactionsState;
	sites?: { items: Record< number | string, SiteDetails > };
}

/**
 * Type of the Calypso Redux store `dispatch` function. Accepts both plain actions and thunks.
 *
 * TODO: Change `any` to `AnyAction` when all action creators have been converted to TS.
 */
export type CalypsoDispatch = ThunkDispatch< IAppState, unknown, any >;
