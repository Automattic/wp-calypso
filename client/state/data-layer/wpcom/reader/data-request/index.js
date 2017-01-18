/**
 * Internal dependencies
 */
import { READER_DATA_REQUEST } from 'state/action-types';

export const readerDataHandler = ( { dispatch }, {
	dataFetch,
	dispatchArgs = {},
	requestAction,
} ) => {

	dispatch( {
		type: requestAction,
		...dispatchArgs,
	} );

	return dataFetch
		.then(
			data => {
				dispatch( {
					type: `${ requestAction }_SUCCESS`,
					...data,
					...dispatchArgs,
				} );
			} )
		.catch(
			error => {
				dispatch( {
					type: `${ requestAction }_FAILURE`,
					error,
					...dispatchArgs,
				} );
			}
		);
};

export default {
	[ READER_DATA_REQUEST ]: readerDataHandler
};
