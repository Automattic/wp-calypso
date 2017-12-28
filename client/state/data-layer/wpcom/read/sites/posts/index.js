/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';

import follow from './follow';
import mute from './mute';

export default mergeHandlers( follow, mute );
