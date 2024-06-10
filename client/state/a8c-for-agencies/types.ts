import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export interface Agency {
	id: number;
	name: string;
	url: string;
	icon: {
		img: string;
		icon: string;
	};
	third_party: null | {
		pressable: null | {
			a4a_id: string;
			email: string;
			name: string;
			pressable_id: number;
		};
	};
}

export interface AgencyStore {
	hasFetched: boolean;
	isFetching: boolean;
	activeAgency: Agency | null;
	agencies: Agency[] | [];
	error: APIError | null;
}

export interface Client {
	id: number;
	email: string;
}

export interface ClientStore {
	hasFetched: boolean;
	isFetching: boolean;
	client: Client | null;
	error: APIError | null;
}

export type AgencyThunkAction< A extends Action = AnyAction, R = unknown > = ThunkAction<
	void,
	A4AStore,
	R,
	A
>;

interface CombinedStore {
	agencies: AgencyStore;
	client: ClientStore;
}

/**
 * Represents the entire Redux store but defines only the parts that the A4A deals with.
 */
export interface A4AStore {
	a8cForAgencies: CombinedStore;
}
