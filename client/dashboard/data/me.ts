import wpcom from 'calypso/lib/wp';

export type UserFlags = 'calypso_allow_nonprimary_domains_without_plan';

export interface User {
	ID: number;
	username: string;
	display_name: string;
	avatar_URL?: string;
	language: string;
	locale_variant: string;
	email: string;
	site_count: number;
	meta: {
		data: {
			flags: {
				active_flags: UserFlags[];
			};
		};
	};
}

export interface TwoStep {
	two_step_reauthorization_required: boolean;
}

export async function fetchUser(): Promise< User > {
	return wpcom.req.get( '/me', { meta: 'flags' } );
}

export async function fetchTwoStep(): Promise< TwoStep > {
	return wpcom.req.get( '/me/two-step' );
}
