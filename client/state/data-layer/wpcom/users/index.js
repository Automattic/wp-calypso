/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import authOptions from './auth-options';
import social from './social';

export default mergeHandlers( authOptions, social );
