/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import transfer from './transfer';
import validationSchemas from './validation-schemas';

export default mergeHandlers( transfer, validationSchemas );
