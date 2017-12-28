/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import countries from './countries-list';

export default mergeHandlers( countries );
