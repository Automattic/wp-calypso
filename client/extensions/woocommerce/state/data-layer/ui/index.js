/**
 * Internal dependencies
 */

import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import payments from './payments';
import products from './products';

export default mergeHandlers( payments, products );
