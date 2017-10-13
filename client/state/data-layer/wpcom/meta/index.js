/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import countries from './sms-country-codes';

export default mergeHandlers( countries );
