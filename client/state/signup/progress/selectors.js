/** @format */

/**
 * External dependencies
 */

import { get, filter, head, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns the progress collection of the signup flopw
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}        The progress collection
 */
export const getSignupProgress = state => get( state, 'signup.progress', [] );

/**
 * Returns the last incomplete step in the signup flow
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The step name, or '' if none found
 */
export const getLastIncompleteSignupStep = createSelector(
	state => {
		const lastSignupStepInProgress = head(
			orderBy(
				filter( state.signup.progress, { status: 'in-progress' } ),
				[ 'lastUpdated' ],
				[ 'desc' ]
			)
		);
		return lastSignupStepInProgress || null;
	},
	[ getSignupProgress ]
);
