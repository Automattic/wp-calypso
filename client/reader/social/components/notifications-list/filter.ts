import { NOTIFICATIONS_FILTERS, type NotificationsFilter } from '@automattic/api-core';

/**
 * `ChipFilter` is the UI alias for the shared `NotificationsFilter`
 * union exported by `@automattic/api-core`. The api-core module also
 * exports the wire mapper used by the per-protocol notifications
 * hooks, so the chip strip and the wire boundary share a single
 * source of truth.
 */
export type ChipFilter = NotificationsFilter;

export const CHIP_FILTERS: readonly ChipFilter[] = NOTIFICATIONS_FILTERS;
