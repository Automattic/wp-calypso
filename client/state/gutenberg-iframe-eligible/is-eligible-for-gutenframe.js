/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/gutenberg-iframe-eligible/init';

export const isEligibleForGutenframe = ( state, siteId ) =>
	get( state, [ 'gutenbergIframeEligible', siteId ], true );

export default isEligibleForGutenframe;
