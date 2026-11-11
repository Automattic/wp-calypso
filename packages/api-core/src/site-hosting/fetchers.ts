import { wpcom } from '../wpcom-fetcher';
import type { DataCenterOption, WordPressTrackVersions } from './types';

export async function fetchWordPressVersion( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/wp-version`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchPendingWordPressVersion( siteId: number ): Promise< string | null > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/wp-version/pending`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchWordPressTrackVersions(
	siteId: number
): Promise< WordPressTrackVersions > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/wpcomsh/v1/wordpress-versions',
	} );
	return data;
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
