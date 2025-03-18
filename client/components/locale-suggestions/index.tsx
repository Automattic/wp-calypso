import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import {
	createInterpolateElement,
	useCallback,
	useEffect,
	useState,
	useMemo,
} from '@wordpress/element';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
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

interface LocaleSuggestionsProps {
	locale?: string;
	path: string;
}

/**
 * React hook that detects the user's preferred locale from browser settings
 * Returns undefined if no supported locale is found
 */
const useBrowserLocale = (): string | undefined => {
	return useMemo( () => {
		if ( typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					return language.langSlug;
				}
			}
		}

		return undefined;
	}, [] );
};

/**
 * React hook that returns the user's other locales from the locale suggestions
 * Returns an empty array if no other locales are found
 */
const useUsersOtherLocales = () => {
	const localeSuggestions = useSelector( getLocaleSuggestions ) as LocaleSuggestion[] | null;
	const currentLocaleSlug = getLocaleSlug() ?? '';

	return useMemo(
		() =>
			localeSuggestions?.filter( ( locale ) => ! currentLocaleSlug.startsWith( locale.locale ) ) ??
			[],
		[ localeSuggestions, currentLocaleSlug ]
	);
};

/**
 * React hook that returns the translated string for locale suggestions
 * Returns null if there are no other locales to suggest
 */
const useTranslatedString = ( {
	path,
	onLocaleSuggestionClick,
}: {
	path: string;
	onLocaleSuggestionClick: (
		event: React.MouseEvent< HTMLAnchorElement >,
		localeSlug: string
	) => void;
} ) => {
	const translate = useTranslate();
	const usersOtherLocales = useUsersOtherLocales();

	const getPathWithLocale = useCallback(
		( localeSlug: string ) => addLocaleToPath( path, localeSlug ),
		[ path ]
	);

	const createLinkElement = useCallback(
		( localeItem: LocaleSuggestion ) => (
			<a
				key={ localeItem.locale }
				href={ getPathWithLocale( localeItem.locale ) }
				onClick={ ( event ) => onLocaleSuggestionClick( event, localeItem.locale ) }
				className="locale-suggestions__locale-link"
			/>
		),
		[ getPathWithLocale, onLocaleSuggestionClick ]
	);

	return useMemo( () => {
		if ( 0 === usersOtherLocales.length ) {
			return null;
		}

		if ( 1 === usersOtherLocales.length ) {
			const locale = usersOtherLocales[ 0 ];

			return createInterpolateElement(
				translate( 'Also available in %(language)s', {
					args: { language: `<link>${ locale.name }</link>` },
					comment:
						'language is a single translated name e.g. in Greek for Greek, in French for French',
				} ) as string,
				{
					link: createLinkElement( locale ),
				}
			);
		}

		// An object of link elements for interpolation
		const links = Object.fromEntries(
			usersOtherLocales.map( ( locale, index ) => [
				`link${ index }`,
				createLinkElement( locale ),
			] )
		);

		// A list of translated language names marked for interpolation
		const languages = usersOtherLocales.map(
			( locale, index ) => `<link${ index }>${ locale.name }</link${ index }>`
		);

		return createInterpolateElement(
			translate( 'Also available in %(allButLastLanguage)s and %(lastLanguage)s', {
				args: {
					allButLastLanguage: languages.slice( 0, -1 ).join( ', ' ),
					lastLanguage: languages.slice( -1 )[ 0 ],
				},
				comment:
					'allButLastLanguage is a comma-separated list of translated language names (in Greek for Greek language, in French for French, etc.)',
			} ) as string,
			links
		);
	}, [ usersOtherLocales, translate, createLinkElement ] );
};

const LocaleSuggestions = ( { locale: localeFromProps, path }: LocaleSuggestionsProps ) => {
	const [ dismissed, setDismissed ] = useState( false );
	const dispatch = useDispatch();
	const browserLocale = useBrowserLocale();

	const handleLocaleSuggestionClick = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement >, localeSlug: string ) => {
			recordTracksEvent( 'calypso_locale_suggestion_click', {
				sourceLocale: getLocaleSlug(),
				targetLocale: localeSlug,
				path,
			} );

			const localeData = getLanguage( localeSlug );
			const currentLocaleData = getLanguage( getLocaleSlug() ?? undefined );

			if ( localeData?.rtl !== currentLocaleData?.rtl ) {
				event.preventDefault();
				window.location.assign( addLocaleToPath( path, localeSlug ) );
			}

			setDismissed( true );
		},
		[ path ]
	);

	const translatedString = useTranslatedString( {
		path,
		onLocaleSuggestionClick: handleLocaleSuggestionClick,
	} );

	useEffect( () => {
		dispatch( setLocale( localeFromProps ?? browserLocale ?? '' ) );
	}, [ localeFromProps, browserLocale, dispatch ] );

	if ( dismissed ) {
		return null;
	}

	return (
		<>
			<QueryLocaleSuggestions />
			{ translatedString && (
				<div className="locale-suggestions">
					<Notice
						className="locale-suggestions__notice"
						icon="globe"
						showDismiss
						onDismissClick={ () => setDismissed( true ) }
						isCompact
						theme="light"
						status="is-info"
					>
						<div className="locale-suggestions__list">{ translatedString }</div>
					</Notice>
				</div>
			) }
		</>
	);
};

export default LocaleSuggestions;
