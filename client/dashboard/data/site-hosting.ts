import wpcom from 'calypso/lib/wp';
import type { DataCenterOption } from 'calypso/data/data-center/types';

export async function fetchWordPressVersion( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/wp-version`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function updateWordPressVersion( siteId: number, version: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/wp-version`,
			apiNamespace: 'wpcom/v2',
		},
		{ version }
	);
}

export async function fetchPHPVersion( siteId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/php-version`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function updatePHPVersion( siteId: number, version: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/php-version`,
			apiNamespace: 'wpcom/v2',
		},
		{ version }
	);
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

export async function updateStaticFile404Setting( siteId: number, setting: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/static-file-404`,
			apiNamespace: 'wpcom/v2',
		},
		{ setting }
	);
}

export async function clearObjectCache( siteId: number, reason: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/clear-cache`,
			apiNamespace: 'wpcom/v2',
		},
		{ reason }
	);
}

export async function restoreDatabasePassword( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/restore-database-password`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function restoreSitePlanSoftware( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/restore-plan-software`,
		apiNamespace: 'wpcom/v2',
	} );
}
