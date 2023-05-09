import { withoutHttp } from 'calypso/lib/url';
import {
	getSiteOption,
	isJetpackSiteMainNetworkSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'calypso/state/sites/selectors';

/**
 * Returns true if site mainSiteId is the main site of site secondarySiteId and false otherwise.
 * Returns null if with the information available in state the relationship is unknown.
 *
 * @param  {Object} 	state       		Global state tree
 * @param  {number}  	mainSiteId      	The ID of the main site
 * @param  {number}  	secondarySiteId		The ID of the main site
 * @returns {?boolean}	            		Whether site with id equal to mainSiteId is main site of site with id equal to secondarySiteId
 */
export default ( state, mainSiteId, secondarySiteId ) => {
	return (
		isJetpackSiteMainNetworkSite( state, mainSiteId ) &&
		isJetpackSiteSecondaryNetworkSite( state, secondarySiteId ) &&
		withoutHttp( getSiteOption( state, mainSiteId, 'unmapped_url' ) ) ===
			withoutHttp( getSiteOption( state, secondarySiteId, 'main_network_site' ) )
	);
};
