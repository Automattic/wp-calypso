/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import follow from './follow';
import mute from './mute';
import remember from './remember';
import forget from './forget';

export default mergeHandlers( follow, mute, remember, forget );
