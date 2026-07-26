import { useFlowState } from '../declarative-flow/internals/state-manager/store';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';

export function useSiteIdentifier( siteFragment?: number | string ) {
	const siteSlug = useSiteSlugParam();
	const siteIdParam = useSiteIdParam();
	const createdSiteID = useFlowState().get( 'site' )?.siteId;

	return siteFragment || siteIdParam || siteSlug || createdSiteID;
}
