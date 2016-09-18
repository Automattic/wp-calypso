import fetchSitePlans from './site-plans-fetch';
import requestPlans from './plans-request';
import requestPostCounts from './post-counts-request';
import requestSite from './site-request';
import requestSites from './sites-request';
import siteConnectionsRequest from './site-connections-request';

export const handlers = [
	fetchSitePlans,
	requestPlans,
	requestPostCounts,
	requestSite,
	requestSites,
	siteConnectionsRequest,
];

export default handlers;
