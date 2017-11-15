/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import deactivate from './deactivate';
import getCredentials from './get-credentials';
import rewind from './rewind';
import updateCredentials from './update-credentials';

export default mergeHandlers( activate, deactivate, getCredentials, rewind, updateCredentials );
