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
	profile: {
		company_details: {
			name: string;
			email: string;
			website: string;
			bio_description: string;
			logo_url: string;
			landing_page_url: string;
			country: string;
		};
		listing_details: {
			is_available: boolean;
			is_global: boolean;
			industries: string[];
			services: string[];
			products: string[];
			languages_spoken: string[];
		};
		budget_details: {
			budget_lower_range: string;
			budget_upper_range: string;
			has_hourly_rate: boolean;
			hourly_rate_value: string;
		};
		partner_directory_application: null | {
			status?: 'pending' | 'in-progress' | 'completed';
			directories: {
				status: 'pending' | 'approved' | 'rejected' | 'closed';
				directory: 'wordpress' | 'jetpack' | 'woocommerce' | 'pressable';
				urls: string[];
				note: string;
				is_published?: boolean;
			}[];
			feedback_url: string;
			is_published?: boolean;
		};
	};
	partner_directory_allowed: boolean;
}

export interface AgencyStore {
	hasFetched: boolean;
	isFetching: boolean;
	activeAgency: Agency | null;
	agencies: Agency[] | [];
	error: APIError | null;
	isAgencyClientUser: boolean;
}

export type AgencyThunkAction< A extends Action = AnyAction, R = unknown > = ThunkAction<
	void,
	A4AStore,
	R,
	A
>;

interface CombinedStore {
	agencies: AgencyStore;
}

/**
 * Represents the entire Redux store but defines only the parts that the A4A deals with.
 */
export interface A4AStore {
	a8cForAgencies: CombinedStore;
}
