/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import login2fa from './login-2fa';
import usersAuthOptions from './users/auth-options';

export const handlers = mergeHandlers( login2fa, usersAuthOptions );

export default handlers;
