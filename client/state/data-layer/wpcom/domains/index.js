/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import countries from './countries-list';
import transfer from './transfer';
import validationSchemas from './validation-schemas';

export default mergeHandlers( countries, transfer, validationSchemas );
