import { wpcom } from '../wpcom-fetcher';
import type { TrophiesResponse } from './types';

export async function fetchTrophies( page: number ): Promise< TrophiesResponse > {
	return wpcom.req.get(
		{
			path: '/me/trophies',
			apiVersion: '1.1',
		},
		{ number: 100, page }
	);
}
