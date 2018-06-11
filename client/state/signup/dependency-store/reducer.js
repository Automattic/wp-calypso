/** @format */

/**
 * External dependencies
 */

import { keys, difference, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import steps from 'signup/config/steps';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_DEPENDENCY_STORE_UPDATE,
	SIGNUP_PROVIDE_DEPENDENCIES,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { dependencyStoreSchema } from './schema';

function assertValidDependencies( action ) {
	const providesDependencies = steps[ action.data.stepName ].providesDependencies || [];
	const extraDependencies = difference( keys( action.providedDependencies ), providesDependencies );

	if ( ! isEmpty( extraDependencies ) ) {
		throw new Error(
			'This step (' +
				action.data.stepName +
				') provides an unspecified dependency [' +
				extraDependencies.join( ', ' ) +
				'].' +
				' Make sure to specify it in /signup/config/steps.js, using the providesDependencies property.'
		);
	}

	return isEmpty( extraDependencies );
}

function update( state = {}, action ) {
	return { ...state, ...action.data };
}

function handleProvideDependencies( state = {}, action ) {
	if ( assertValidDependencies( action ) ) {
		return update( state, action.providedDependencies );
	}
}

export default createReducer(
	{},
	{
		[ SIGNUP_DEPENDENCY_STORE_UPDATE ]: update,
		[ SIGNUP_PROVIDE_DEPENDENCIES ]: handleProvideDependencies,
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	dependencyStoreSchema
);
