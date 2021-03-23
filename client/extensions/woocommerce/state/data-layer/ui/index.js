/**
 * Internal dependencies
 */

import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import payments from './payments';

export default mergeHandlers( payments );
