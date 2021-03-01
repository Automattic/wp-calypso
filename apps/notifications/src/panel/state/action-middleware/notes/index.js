/**
 * Internal dependencies
 */
import { mergeHandlers } from '../utils';
import readStatus from './read-status';

export default mergeHandlers( readStatus );
