/**
 * External dependencies
 */
import type { Plans } from '@automattic/data-stores';

export type CTAVariation = 'FULL_WIDTH' | 'NORMAL';
export type PopularBadgeVariation = 'ON_TOP' | 'NEXT_TO_NAME';
export type CustomTagLinesMap = Record< Plans.PlanSlug, string >;
