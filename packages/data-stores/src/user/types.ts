import * as selectors from './selectors';
import type { ActionCreators } from './actions';
import type { SelectFromMap } from '../mapped-types';
import type { User } from '@automattic/api-core';

export type CurrentUser = User;
export type UserSelect = SelectFromMap< typeof selectors >;
export type UserActions = ActionCreators;
