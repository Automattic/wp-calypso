/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import rewind from './rewind';

export default mergeHandlers( rewind );
