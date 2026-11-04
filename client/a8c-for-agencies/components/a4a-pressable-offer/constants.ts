export const PRESSABLE_HOLIDAY_2026_OFFER_START_DATE = '2026-11-09';
export const PRESSABLE_HOLIDAY_2026_OFFER_END_DATE = '2026-11-30';
// The offer ends at 11:59pm Pacific on the end date, which is 07:59 UTC the next morning.
export const PRESSABLE_HOLIDAY_2026_OFFER_DEADLINE = new Date( '2026-12-01T07:59:59.999Z' );
export const PRESSABLE_HOLIDAY_2026_OFFER_TERMS_URL =
	'https://pressable.com/legal/2026-holiday-promotion-terms-and-conditions/';

// The Q3 2026 offer has ended. Its dates stay because the expansion offer, which is not
// part of the holiday offer, keys its eligibility on the Q3 start date.
export const PRESSABLE_Q3_2026_OFFER_START_DATE = '2026-08-11';
export const PRESSABLE_Q3_2026_OFFER_END_DATE = '2026-09-30';
export const PRESSABLE_Q3_2026_OFFER_DEADLINE = new Date(
	`${ PRESSABLE_Q3_2026_OFFER_END_DATE }T23:59:59.999Z`
);
export const PRESSABLE_EXPANSION_OFFER_TERMS_URL =
	'https://pressable.com/legal/summer-2026-expansion-incentive-terms-and-conditions/';
