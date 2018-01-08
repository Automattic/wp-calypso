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
import { isTestSite } from 'woocommerce/state/sites/setup-choices/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
const debug = debugFactory( 'woocommerce:analytics' );

export const tracksStore = {
	isTestSite: function() {
		const state = tracksStore.reduxStore.getState();
		const siteId = getSelectedSiteId( state );
		return isTestSite( state, siteId ) || false;
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
};

export const recordTrack = tracksUtils.recordTrack( analytics.tracks, debug, tracksStore );
