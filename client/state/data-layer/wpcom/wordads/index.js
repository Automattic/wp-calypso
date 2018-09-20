/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import earnings from './earnings';
import status from './status';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/wordads/index.js', mergeHandlers( earnings, status ) );
export default {};
