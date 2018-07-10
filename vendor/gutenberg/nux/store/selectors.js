/**
 * External dependencies
 */
import createSelector from 'rememo';
import { includes, difference, keys } from 'lodash';

/**
 * An object containing information about a guide.
 *
 * @typedef {Object} NUX.GuideInfo
 * @property {string[]} tipIds       Which tips the guide contains.
 * @property {?string}  currentTipId The guide's currently showing tip.
 * @property {?string}  nextTipId    The guide's next tip to show.
 */

/**
 * Returns an object describing the guide, if any, that the given tip is a part
 * of.
 *
 * @param {Object} state Global application state.
 * @param {string} tipId The tip to query.
 *
 * @return {?NUX.GuideInfo} Information about the associated guide.
 */
export const getAssociatedGuide = createSelector(
	( state, tipId ) => {
		for ( const tipIds of state.guides ) {
			if ( includes( tipIds, tipId ) ) {
				const nonDismissedTips = difference( tipIds, keys( state.preferences.dismissedTips ) );
				const [ currentTipId = null, nextTipId = null ] = nonDismissedTips;
				return { tipIds, currentTipId, nextTipId };
			}
		}

		return null;
	},
	( state ) => [
		state.guides,
		state.preferences.dismissedTips,
	],
);

/**
 * Determines whether or not the given tip is showing. Tips are hidden if they
 * are disabled, have been dismissed, or are not the current tip in any
 * guide that they have been added to.
 *
 * @param {Object} state Global application state.
 * @param {string} id    The tip to query.
 *
 * @return {boolean} Whether or not the given tip is showing.
 */
export function isTipVisible( state, id ) {
	if ( ! state.preferences.areTipsEnabled ) {
		return false;
	}

	if ( state.preferences.dismissedTips[ id ] ) {
		return false;
	}

	const associatedGuide = getAssociatedGuide( state, id );
	if ( associatedGuide && associatedGuide.currentTipId !== id ) {
		return false;
	}

	return true;
}

/**
 * Returns whether or not tips are globally enabled.
 *
 * @param {Object} state Global application state.
 *
 * @return {boolean} Whether tips are globally enabled.
 */
export function areTipsEnabled( state ) {
	return state.preferences.areTipsEnabled;
}
