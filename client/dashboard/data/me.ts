import wpcom from 'calypso/lib/wp';

export interface User {
	ID: number;
	username: string;
	display_name: string;
	avatar_URL?: string;
	language: string;
	locale_variant: string;
	email: string;
	site_count: number;
}

export interface TwoStep {
	two_step_reauthorization_required: boolean;
}

export async function fetchUser(): Promise< User > {
	return wpcom.req.get( '/me' );
}

export async function fetchTwoStep(): Promise< TwoStep > {
	return wpcom.req.get( '/me/two-step' );
}
