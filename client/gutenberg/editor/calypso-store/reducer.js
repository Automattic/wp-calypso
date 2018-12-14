/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { combineReducers } from '@wordpress/data';

const selectedSiteId = ( state = null, action ) =>
	'GUTENLYPSO_SELECTED_SITE_ID_SET' === action.type ? action.selectedSiteId : state;

export default combineReducers( { selectedSiteId } );
