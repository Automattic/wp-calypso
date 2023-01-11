import type { DEVICE_TYPES } from './constants';
import type { ValuesType } from 'utility-types';

export type Device = ValuesType< typeof DEVICE_TYPES >;
