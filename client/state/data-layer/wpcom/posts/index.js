/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'client/state/action-watchers/utils';
import revisions from './revisions';

export default mergeHandlers( revisions );
