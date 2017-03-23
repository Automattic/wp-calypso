/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
    READER_START_GRADUATE_REQUEST,
    READER_START_GRADUATED,
    READER_START_GRADUATE_REQUEST_SUCCESS,
    READER_START_GRADUATE_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Module variables
 */
const debug = debugModule('calypso:redux:reader-start');

/**
 * Triggers a network request to graduate the logged in user
 * from the Reader following recommendations page.
 *
 * @return {Function} Action thunk
 */
export function requestGraduate() {
    return dispatch => {
        dispatch({
            type: READER_START_GRADUATE_REQUEST,
        });

        debug('Graduating user from cold start');

        return wpcom.undocumented().graduateNewReader().then(
            data => {
                dispatch({
                    type: READER_START_GRADUATE_REQUEST_SUCCESS,
                    data,
                });
                dispatch({
                    type: READER_START_GRADUATED,
                });
            },
            error => {
                dispatch({
                    type: READER_START_GRADUATE_REQUEST_FAILURE,
                    error,
                });
            }
        );
    };
}
