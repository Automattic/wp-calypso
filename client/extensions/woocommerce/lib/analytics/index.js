/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import * as tracksUtils from './tracks-utils';

const debug = debugFactory( 'woocommerce:analytics' );

export const recordTrack = tracksUtils.recordTrack( analytics.tracks, debug );
