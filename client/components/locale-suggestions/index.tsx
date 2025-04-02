import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import Notice from 'calypso/components/notice';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';
import { setLocale } from 'calypso/state/ui/language/actions';

import './style.scss';

interface LocaleSuggestion {
	locale: string;
	name: string;
}

interface LocaleSuggestionsData {
	locales: LocaleSuggestion[];
	availability_text_templates: Record< number, string >;
}

interface LocaleSuggestionsProps {
	path: string;
	locale?: string;
}

/**
 * Hook to get the user's browser locale.
 * @returns {string|undefined} The browser's locale slug if available.
 */
function useBrowserLocale(): string | undefined {
	return useMemo( () => {
		if ( typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					return language.langSlug;
				}
			}
		}
	}, [] );
}

/**
 * Hook to get the list of other locales available to the user.
 * @returns {LocaleSuggestion[]} Array of locale suggestions excluding the current locale.
 */
function useUserOtherLocales(): LocaleSuggestion[] {
	// eslint-disable-next-line wpcalypso/i18n-translate-identifier
	const { localeSlug: currentLocale } = useTranslate();
	const localeSuggestions = useSelector( getLocaleSuggestions ) as
		| LocaleSuggestionsData
		| undefined;

	return useMemo( () => {
		if ( ! localeSuggestions?.locales ) {
			return [];
		}

		return localeSuggestions.locales.filter(
			( { locale } ) => ! locale.startsWith( currentLocale as string )
		);
	}, [ localeSuggestions?.locales, currentLocale ] );
}

/**
 * Hook to get the locale availability text based on the number of available locales.
 * @returns {string|undefined} The availability text template.
 */
function useLocaleAvailabilityText(): string | undefined {
	const userOtherLocales = useUserOtherLocales();
	const localeSuggestions = useSelector( getLocaleSuggestions ) as
		| LocaleSuggestionsData
		| undefined;

	/**
	 * The `availability_text_templates` data is expect to include templates for 1, 2 and 3 available locales.
	 */
	return localeSuggestions?.availability_text_templates?.[ userOtherLocales.length ];
}

export default function LocaleSuggestions( { path, locale }: LocaleSuggestionsProps ) {
	const [ isDismissed, setIsDismissed ] = useState( false );
	const dispatch = useDispatch();
	const browserLocale = useBrowserLocale();
	const userOtherLocales = useUserOtherLocales();
	const availabilityText = useLocaleAvailabilityText();
	// eslint-disable-next-line wpcalypso/i18n-translate-identifier
	const { localeSlug: sourceLocale } = useTranslate();

	// Use the provided locale prop to set the locale or fallback to the browser locale settings.
	useEffect( () => {
		dispatch( setLocale( locale ?? browserLocale ?? '' ) );
	}, [ locale, browserLocale, dispatch ] );

	const handleLocaleSuggestionClick = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement >, targetLocale: string ) => {
			recordTracksEvent( 'calypso_locale_suggestion_click', {
				source_locale: sourceLocale,
				target_locale: targetLocale,
				path,
			} );

			setIsDismissed( true );

			const sourceLocaleData = getLanguage( sourceLocale );
			const targetLocaleData = getLanguage( targetLocale );

			// Perform page reload when the text direction changes, e.g. from LTR to RTL and vice versa.
			if ( sourceLocaleData?.rtl !== targetLocaleData?.rtl ) {
				event.preventDefault();
				window.location.assign( addLocaleToPath( path, targetLocale ) );
			}
		},
		[ path, sourceLocale ]
	);

	// Compute the locale suggestion links interpolation conversion map for the availability text.
	const userOtherLocalesComponentsMap = useMemo( () => {
		return Object.fromEntries(
			userOtherLocales.map( ( localeSuggestion: LocaleSuggestion, index: number ) => [
				`LocaleSuggestion${ index }`,
				<a
					key={ localeSuggestion.locale }
					href={ addLocaleToPath( path, localeSuggestion.locale ) }
					onClick={ ( event ) => handleLocaleSuggestionClick( event, localeSuggestion.locale ) }
					className="locale-suggestions__locale-link"
				>
					{ localeSuggestion.name }
				</a>,
			] )
		);
	}, [ handleLocaleSuggestionClick, path, userOtherLocales ] );

	const isLocaleSuggestionsVisible = userOtherLocales.length > 0 && availabilityText;
	const availabilityTextInterpolated = useMemo( () => {
		if ( ! isLocaleSuggestionsVisible ) {
			return null;
		}

		// Compute the availability string replacing string arguments with component placeholders, e.g. "Also available in <LocaleSuggestion1 /> and <LocaleSuggestion2 />".
		const availabilityTextWithComponentPlaceholders = sprintf(
			availabilityText,
			...Object.keys( userOtherLocalesComponentsMap ).map(
				( componentKey ) => `<${ componentKey } />`
			)
		);

		return createInterpolateElement(
			availabilityTextWithComponentPlaceholders,
			userOtherLocalesComponentsMap
		);
	}, [ userOtherLocalesComponentsMap, availabilityText, isLocaleSuggestionsVisible ] );

	if ( isDismissed ) {
		return true;
	}

	return (
		<>
			<QueryLocaleSuggestions />

			{ isLocaleSuggestionsVisible && (
				<div className="locale-suggestions">
					<Notice
						className="locale-suggestions__notice"
						icon="globe"
						showDismiss
						onDismissClick={ () => setIsDismissed( true ) }
						isCompact
						theme="light"
						status="is-info"
					>
						{ availabilityTextInterpolated }
					</Notice>
				</div>
			) }
		</>
	);
}
