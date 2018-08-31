/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import requestReset from './request-reset';
import reset from './reset';
import validate from './validate';

export default mergeHandlers( requestReset, reset, validate );
