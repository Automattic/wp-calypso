/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { LOADING } from 'woocommerce/state/constants';

const getShippingClassesFromState = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'shippingClasses' ], false );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping classes have been successfully loaded from the server
 */
export const areShippingClassesLoaded = ( state, siteId = getSelectedSiteId( state ) ) => {
	return isArray( getShippingClassesFromState( state, siteId ) );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the shipping classes are currently being retrieved from the server
 */
export const areShippingClassesLoading = ( state, siteId = getSelectedSiteId( state ) ) => {
	return LOADING === getShippingClassesFromState( state, siteId );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of available shipping classes.
 */
export const getShippingClassOptions = ( state, siteId = getSelectedSiteId( state ) ) => {
	const classes = getShippingClassesFromState( state, siteId );

	return isArray( classes ) ? classes : [];
};
