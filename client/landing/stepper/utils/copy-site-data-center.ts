import { isDataCenterOption } from '@automattic/api-core';
import type { DataCenterOption } from '@automattic/api-core';

export const COPY_SITE_DATA_CENTER_PARAM = 'dataCenter';

/**
 * The data center chosen for a copy, from the copy-site flow's URL. Unknown values are ignored,
 * so the copy stays in the original site's data center.
 */
export function getCopySiteDataCenter(
	searchParams: URLSearchParams
): DataCenterOption | undefined {
	const value = searchParams.get( COPY_SITE_DATA_CENTER_PARAM );
	return isDataCenterOption( value ) ? value : undefined;
}

export function getCopyFromSiteBody( sourceSiteId: number, dataCenter?: DataCenterOption ) {
	return {
		source_blog_id: sourceSiteId,
		...( dataCenter && { geo_affinity: dataCenter } ),
	};
}
