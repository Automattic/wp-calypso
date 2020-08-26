/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/gutenberg-iframe-eligible/init';

export const isEligibleForGutenframe = ( state, siteId ) =>
	get( state, [ 'gutenbergIframeEligible', siteId ], false );

export default isEligibleForGutenframe;
