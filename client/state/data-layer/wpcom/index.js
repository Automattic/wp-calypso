import fetchSitePlans from './site-plans-fetch';
import requestPlans from './plans-request';
import requestSite from './site-request';
import requestSites from './sites-request';

export const handlers = [
	fetchSitePlans,
	requestPlans,
	requestSite,
	requestSites,
];

export default handlers;
