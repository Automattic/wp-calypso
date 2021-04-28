/**
 * Internal dependencies
 */
import type { ExperimentAssignment } from '../types';
import * as Validations from './validations';

const localStorage =
	typeof window !== 'undefined' && window.localStorage
		? window.localStorage
		: // LocalStorage polyfill from https://gist.github.com/juliocesar/926500
		  {
				_data: {} as Record< string, string >,
				setItem: function ( id: string, val: string ) {
					return ( this._data[ id ] = String( val ) );
				},
				getItem: function ( id: string ) {
					return this._data.hasOwnProperty( id ) ? this._data[ id ] : undefined;
				},
				removeItem: function ( id: string ) {
					return delete this._data[ id ];
				},
				clear: function () {
					return ( this._data = {} );
				},
		  };

const localStorageExperimentAssignmentKeyPrefix = 'explat-experiment-';

const localStorageExperimentAssignmentKey = ( experimentName: string ): string =>
	`${ localStorageExperimentAssignmentKeyPrefix }-${ experimentName }`;

export function clearAllExperimentAssignments(): void {
	localStorage.clear();
}

/**
 * Class to store existing ExperimentAssignments in localStorage
 */
export default class ExperimentAssignmentStore {
	/**
	 * Store an ExperimentAssignment.
	 *
	 * @param experimentAssignment The ExperimentAssignment
	 */
	store( experimentAssignment: ExperimentAssignment ): void {
		Validations.validateExperimentAssignment( experimentAssignment );

		const previousExperimentAssignment = this.retrieve( experimentAssignment.experimentName );
		if (
			previousExperimentAssignment &&
			experimentAssignment.retrievedTimestamp < previousExperimentAssignment.retrievedTimestamp
		) {
			throw new Error(
				'Trying to store an older experiment assignment than is present in the store, likely a race condition.'
			);
		}

		localStorage.setItem(
			localStorageExperimentAssignmentKey( experimentAssignment.experimentName ),
			JSON.stringify( experimentAssignment )
		);
	}

	/**
	 * Retrieve an ExperimentAssignment.
	 *
	 * @param experimentName The experiment name.
	 */
	retrieve( experimentName: string ): ExperimentAssignment | undefined {
		const maybeExperimentAssignmentJson = localStorage.getItem(
			localStorageExperimentAssignmentKey( experimentName )
		);
		if ( ! maybeExperimentAssignmentJson ) {
			return undefined;
		}

		return Validations.validateExperimentAssignment( JSON.parse( maybeExperimentAssignmentJson ) );
	}
}
