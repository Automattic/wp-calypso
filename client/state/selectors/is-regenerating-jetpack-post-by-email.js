/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getRequest } from 'state/selectors';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';

/**
 * Returns true if we are currently making a request to regenerate the Post By Email address. False otherwise
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}             Whether Post by Email address is currently being updated
 */
export default function isRegeneratingJetpackPostByEmail( state, siteId ) {
	return get(
		getRequest( state, saveJetpackSettings( siteId, { post_by_email_address: 'regenerate' } ) ),
		'isLoading',
		false
	);
}
