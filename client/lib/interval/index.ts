/**
 * Internal dependencies
 */
import { TimeoutMS } from 'calypso/types';

export { Interval } from './interval';
export { useInterval } from './use-interval';

export const EVERY_SECOND: TimeoutMS = 1000;
export const EVERY_FIVE_SECONDS: TimeoutMS = 5 * 1000;
export const EVERY_TEN_SECONDS: TimeoutMS = 10 * 1000;
export const EVERY_THIRTY_SECONDS: TimeoutMS = 30 * 1000;
export const EVERY_MINUTE: TimeoutMS = 60 * 1000;
