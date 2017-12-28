/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'client/state/action-watchers/utils';
import eligibility from './eligibility';
import initiate from './initiate';
import status from './status';

export default mergeHandlers( eligibility, initiate, status );
