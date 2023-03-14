import * as selectors from './selectors';
import type { LaunchStep } from './data';
import type { SelectFromMap } from '../mapped-types';
import type { ValuesType } from 'utility-types';

export type LaunchStepType = ValuesType< typeof LaunchStep >;

export type LaunchSelect = SelectFromMap< typeof selectors >;
