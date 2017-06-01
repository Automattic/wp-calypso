/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import status from './status';

export default mergeHandlers( status );
