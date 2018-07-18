/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import earnings from './earnings';
import status from './status';

export default mergeHandlers( earnings, status );
