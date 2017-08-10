/** @format */
/**
 * Internal dependencies
 */
import {
	getSiteOption,
	isJetpackSiteMainNetworkSite,
	isJetpackSiteSecondaryNetworkSite,
} from 'state/sites/selectors';
import { withoutHttp } from 'lib/url';

/**
 * Returns true if site mainSiteId is the main site of site secondarySiteId and false otherwise.
 * Returns null if with the information available in state the relationship is unknown.
 *
 * @param  {Object} 	state       		Global state tree
 * @param  {Number}  	mainSiteId      	The ID of the main site
 * @param  {Number}  	secondarySiteId		The ID of the main site
 * @return {?Boolean}	            		Whether site with id equal to mainSiteId is main site of site with id equal to secondarySiteId
 */
export default ( state, mainSiteId, secondarySiteId ) => {
	return (
		isJetpackSiteMainNetworkSite( state, mainSiteId ) &&
		isJetpackSiteSecondaryNetworkSite( state, secondarySiteId ) &&
		withoutHttp( getSiteOption( state, mainSiteId, 'unmapped_url' ) ) ===
			withoutHttp( getSiteOption( state, secondarySiteId, 'main_network_site' ) )
	);
};
