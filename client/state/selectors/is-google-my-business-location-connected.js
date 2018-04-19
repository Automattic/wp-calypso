/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

const getGoogleMyBusinessLocationId = ( state, siteId ) => {
	return get( state, `googleMyBusiness.${ siteId }.location.id`, null );
};

export default function isGoogleMyBusinessLocationConnected( state, siteId ) {
	return getGoogleMyBusinessLocationId( state, siteId ) !== null;
}
