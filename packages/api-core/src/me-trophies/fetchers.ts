import { wpcom } from '../wpcom-fetcher';
import type { TrophiesResponse } from './types';

export async function fetchTrophies(): Promise< TrophiesResponse > {
	return wpcom.req.get( {
		path: '/me/trophies',
		apiVersion: '1.1',
		query: { number: 100 },
	} );
}
