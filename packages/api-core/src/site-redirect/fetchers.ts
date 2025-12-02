import { isWpError } from '../error';
import { wpcom } from '../wpcom-fetcher';
import { SiteRedirect } from './types';

export async function fetchSiteRedirect( siteId: number ): Promise< SiteRedirect > {
	try {
		return await wpcom.req.get( {
			path: `/sites/${ siteId }/domains/redirect`,
			apiVersion: '1.1',
		} );
	} catch ( error ) {
		if ( isWpError( error ) && error.statusCode === 400 ) {
			return {};
		}
		throw error;
	}
}
