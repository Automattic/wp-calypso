/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import countries from './sms-country-codes';

export default mergeHandlers( countries );
