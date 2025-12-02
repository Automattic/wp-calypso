import { wpcom } from '../wpcom-fetcher';
import type { DataCenterOption } from './types';

export async function fetchWordPressVersion( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/wp-version`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchPHPVersion( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/php-version`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchPhpMyAdminToken( siteId: number ): Promise< string > {
	const { token } = await wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/pma/token`,
		apiNamespace: 'wpcom/v2',
	} );
	return token;
}

export async function fetchPrimaryDataCenter( siteId: number ): Promise< DataCenterOption | null > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/geo-affinity`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchStaticFile404Setting( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/static-file-404`,
		apiNamespace: 'wpcom/v2',
	} );
}
