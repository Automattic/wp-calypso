/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import countries from './countries-list';
import contactDetailsValidation from './contact-details-validation';

export default mergeHandlers( contactDetailsValidation, countries );
