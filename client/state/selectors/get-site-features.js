import getRawSite from './get-raw-site';

export default function getSiteFeatures( state, siteId ) {
	return getRawSite( state, siteId )?.plan?.features ?? null;
}
