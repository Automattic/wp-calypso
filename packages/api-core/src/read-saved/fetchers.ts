import { wpcom } from '../wpcom-fetcher';
import type { ReadSavedKeysResponse } from './types';

export const fetchReadSavedKeys = (): Promise< ReadSavedKeysResponse > =>
	wpcom.req.get( {
		path: '/read/saved/keys',
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );
