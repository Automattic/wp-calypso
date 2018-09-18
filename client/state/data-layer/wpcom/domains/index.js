/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import countries from './countries-list';
import transfer from './transfer';
import validationSchemas from './validation-schemas';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/domains/index.js',
	mergeHandlers( countries, transfer, validationSchemas )
);

export default {};
