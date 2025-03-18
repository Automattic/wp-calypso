import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getLanguage, addLocaleToPath } from '@automattic/i18n-utils';
import { createInterpolateElement, useCallback, useEffect, useState } from '@wordpress/element';
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

const LocaleSuggestions = ( { locale: localeFromProps, path }: LocaleSuggestionsProps ) => {
	const translate = useTranslate();
	const [ dismissed, setDismissed ] = useState( false );
	const dispatch = useDispatch();
	const localeSuggestions = useSelector( getLocaleSuggestions ) as LocaleSuggestion[] | null;

	const getPathWithLocale = useCallback(
		( localeSlug: string ) => addLocaleToPath( path, localeSlug ),
		[ path ]
	);

	const recordLocaleSuggestionClick = useCallback(
		( localeSlug: string ) => {
			recordTracksEvent( 'calypso_locale_suggestion_click', {
				sourceLocale: getLocaleSlug(),
				targetLocale: localeSlug,
				path,
			} );
		},
		[ path ]
	);

	const handleLocaleSuggestionClick = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement >, localeSlug: string ) => {
			recordLocaleSuggestionClick( localeSlug );

			const localeData = getLanguage( localeSlug );
			const currentLocaleData = getLanguage( getLocaleSlug() ?? undefined );

			if ( localeData?.rtl !== currentLocaleData?.rtl ) {
				event.preventDefault();
				window.location.assign( getPathWithLocale( localeSlug ) );
			}

			setDismissed( true );
		},
		[ getPathWithLocale, recordLocaleSuggestionClick ]
	);

	const createLinkElement = useCallback(
		( localeItem: LocaleSuggestion ) => (
			<a
				key={ localeItem.locale }
				href={ getPathWithLocale( localeItem.locale ) }
				onClick={ ( event ) => handleLocaleSuggestionClick( event, localeItem.locale ) }
				className="locale-suggestions__locale-link"
			/>
		),
		[ getPathWithLocale, handleLocaleSuggestionClick ]
	);

	const usersOtherLocales =
		localeSuggestions?.filter(
			( locale ) => ! ( getLocaleSlug() ?? '' ).startsWith( locale.locale )
		) ?? [];

	let translatedString;
	if ( 0 === usersOtherLocales.length ) {
		translatedString = null;
	} else if ( 1 === usersOtherLocales.length ) {
		const locale = usersOtherLocales[ 0 ];
		translatedString = createInterpolateElement(
			translate( 'Also available in %(language)s', {
				args: { language: `<link>${ locale.name }</link>` },
				comment:
					'language is a single translated name e.g. in Greek for Greek, in French for French',
			} ) as string,
			{
				link: createLinkElement( locale ),
			}
		);
	} else {
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

		translatedString = createInterpolateElement(
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
	}

	useEffect( () => {
		let locale = localeFromProps;

		if ( ! locale && typeof navigator === 'object' && 'languages' in navigator ) {
			for ( const langSlug of navigator.languages ) {
				const language = getLanguage( langSlug.toLowerCase() );
				if ( language ) {
					locale = language.langSlug;
					break;
				}
			}
		}

		dispatch( setLocale( locale ?? '' ) );
	}, [ localeFromProps, dispatch ] );

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
