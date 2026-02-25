export const A4A_MIGRATED_SITE_TAG = 'a4a_self_migrated_site';
export const A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026 =
	'a4a_self_migrated_site_pressable_incentive_2026';

/**
 * Cut-off date: agencies with a Pressable purchase (start_date) after this date and before the promo
 * start are not eligible for migration tagging (they were already Pressable customers before the promo).
 */
export const PRESSABLE_LAST_PURCHASE_CUTOFF_DATE = '2025-08-10';

/**
 * Promotion start date: agencies who first bought Pressable on or after this date are eligible
 * for migration tagging (new customers during the promotion).
 */
export const PRESSABLE_PROMO_START_DATE = '2026-02-11';
