import { Dialog, Gridicon } from '@automattic/components';
import { jetpackComLocales, useLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import { useSelector } from 'calypso/state';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import translations from './translations';
import './style.scss';

type Props = {
	isVisible: boolean;
	onClose: () => void;
};

type LanguageNames = {
	[ code: string ]: {
		name: string;
	};
};

type Translations = {
	[ code: string ]: {
		translation: string;
	};
};

const LocaleSwitcher: React.FC< Props > = ( { isVisible, onClose } ) => {
	const translate = useTranslate();
	const defaultLocale = useLocale();
	const [ selectedLocale, setSelectedLocale ] = useState( defaultLocale );
	const names = useSelector( getLocalizedLanguageNames ) as LanguageNames;

	const languages = names
		? jetpackComLocales.map( ( code ) => ( {
				label: names[ code ].name || code,
				code,
		  } ) )
		: [];
	const absoluteHref =
		typeof window !== 'undefined'
			? window.location.href
					.replace( window.location.origin, '' )
					.replace( new RegExp( `^(/${ defaultLocale }/)` ), '/' )
			: '/pricing';

	const onMouseOver = useCallback(
		( code: string ) => setSelectedLocale( code ),
		[ setSelectedLocale ]
	);
	const onMouseLeave = useCallback(
		() => setSelectedLocale( defaultLocale ),
		[ defaultLocale, setSelectedLocale ]
	);

	return (
		<Dialog
			isVisible={ isVisible }
			onClose={ onClose }
			additionalClassNames="locale-switcher__content"
			additionalOverlayClassNames="locale-switcher__overlay"
			className="locale-switcher"
		>
			<QueryLanguageNames />
			<div className="locale-switcher__header">
				<h1 className="locale-switcher__title">
					{ ( translations as Translations )[ selectedLocale ]?.translation ||
						translate( 'Language' ) }
				</h1>
				<button
					className="locale-switcher__close-btn"
					onClick={ onClose }
					aria-label={
						translate( 'Close language selector', {
							comment:
								'Text read by screen readers when the close button of the language selector gets focus.',
						} ) as string
					}
				>
					<Gridicon icon="cross" size={ 36 } />
				</button>
			</div>
			<ul className="locale-switcher__list">
				{ languages.map( ( { label, code } ) => (
					<li key={ code }>
						<a
							className={ clsx( 'locale-switcher__link', {
								'is-active': code === defaultLocale,
							} ) }
							href={ '/' + code + absoluteHref }
							onMouseOver={ () => onMouseOver( code ) }
							onMouseLeave={ onMouseLeave }
							onFocus={ () => null }
							onClick={ onClose }
						>
							{ label }
						</a>
					</li>
				) ) }
			</ul>
		</Dialog>
	);
};

export default LocaleSwitcher;
