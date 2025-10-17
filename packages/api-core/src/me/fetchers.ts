import { wpcom } from '../wpcom-fetcher';
import type { User, TwoStep } from './types';

export async function fetchUser(): Promise< User > {
	return wpcom.req.get( '/me', { meta: 'flags' } );
}

export async function fetchTwoStep(): Promise< TwoStep > {
	return wpcom.req.get( '/me/two-step' );
}
