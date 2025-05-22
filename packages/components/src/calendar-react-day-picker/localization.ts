import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import type { Modifiers, BaseProps } from './types';

function isLocaleRTL( localeCode: string ) {
	const localeObj = new Intl.Locale( localeCode );
	if ( 'getTextInfo' in localeObj ) {
		// @ts-expect-error - getTextInfo is not typed yet
		// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
		return localeObj.getTextInfo().direction === 'rtl';
	}
	return [
		'ar', // Arabic
		'he', // Hebrew
		'fa', // Persian (Farsi)
		'ur', // Urdu
		'ps', // Pashto
		'syr', // Syriac
		'dv', // Divehi
		'ku', // Kurdish (Sorani)
		'yi', // Yiddish
	].includes( localeObj.language );
}

/**
 * Returns localization props for the calendar components.
 *
 * Notes:
 * - the following props should be intended as defaults, and should
 *   be overridden by consumer props if listed as public props.
 * - It is possible for the translated strings to use a different locale
 *   than the formatted dates and the computed `dir`. This is because the
 *   translation function doesn't expose the locale used for the translated
 *   strings, meaning that the dates are formatted using the `locale` prop.
 *   For a correct localized experience, consumers should make sure that
 *   translation context and `locale` prop are consistent.
 */
export const useLocalizationProps = ( {
	locale,
	timeZone,
	mode,
}: {
	locale: NonNullable< BaseProps[ 'locale' ] >;
	timeZone: BaseProps[ 'timeZone' ];
	mode: 'single' | 'range';
} ) => {
	const { __ } = useI18n();

	return useMemo( () => {
		// ie. April 2025
		const monthNameFormatter = new Intl.DateTimeFormat( locale.code, {
			year: 'numeric',
			month: 'long',
			timeZone,
		} );
		// ie. M, T, W, T, F, S, S
		const weekdayNarrowFormatter = new Intl.DateTimeFormat( locale.code, {
			weekday: 'narrow',
			timeZone,
		} );
		// ie. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
		const weekdayLongFormatter = new Intl.DateTimeFormat( locale.code, {
			weekday: 'long',
			timeZone,
		} );
		// ie. Monday, April 29, 2025
		const fullDateFormatter = new Intl.DateTimeFormat( locale.code, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone,
		} );

		// Note: the following props should be intended as defaults, and should
		// be overridden by consumer props if listed as public props.
		return {
			'aria-label': mode === 'single' ? __( 'Date calendar' ) : __( 'Date range calendar' ),
			labels: {
				/** The label for the month grid. */
				labelGrid: ( date: Date ) => monthNameFormatter.format( date ),
				/** The label for the gridcell, when the calendar is not interactive. */
				labelGridcell: (
					date: Date,
					/** The modifiers for the day. */
					modifiers?: Modifiers
				) => {
					const formattedDate = fullDateFormatter.format( date );
					let label = formattedDate;
					if ( modifiers?.today ) {
						label = sprintf(
							// translators: %s is the full date (e.g. "Monday, April 29, 2025")
							__( 'Today, %s' ),
							formattedDate
						);
					}
					return label;
				},
				/** The label for the "next month" button. */
				labelNext: () => __( 'Go to the Next Month' ),
				/** The label for the "previous month" button. */
				labelPrevious: () => __( 'Go to the Previous Month' ),
				/** The label for the day button. */
				labelDayButton: (
					date: Date,
					/** The modifiers for the day. */
					modifiers?: Modifiers
				) => {
					const formattedDate = fullDateFormatter.format( date );
					let label = formattedDate;
					if ( modifiers?.today ) {
						label = sprintf(
							// translators: %s is the full date (e.g. "Monday, April 29, 2025")
							__( 'Today, %s' ),
							formattedDate
						);
					}
					if ( modifiers?.selected ) {
						label = sprintf(
							// translators: %s is the full date (e.g. "Monday, April 29, 2025")
							__( '%s, selected' ),
							formattedDate
						);
					}
					return label;
				},
				/** The label for the weekday. */
				labelWeekday: ( date: Date ) => weekdayLongFormatter.format( date ),
			},
			locale,
			dir: isLocaleRTL( locale.code ) ? 'rtl' : 'ltr',
			formatters: {
				formatWeekdayName: ( date: Date ) => {
					return weekdayNarrowFormatter.format( date );
				},
				formatCaption: ( date: Date ) => {
					return monthNameFormatter.format( date );
				},
			},
			timeZone,
		} as const;
	}, [ locale, timeZone, mode, __ ] );
};
