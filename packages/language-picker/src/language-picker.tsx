/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	Button,
	CustomSelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	SearchControl,
	Icon,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { undo as closeIcon, search as searchIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState, useRef, useEffect } from 'react';
import { getSearchedLanguages, LocalizedLanguageNames } from './search';
import type { Language, LanguageGroup } from './Language';
import type { ReactNode, MouseEvent, KeyboardEvent } from 'react';

import './style.scss';

type KeyboardOrMouseEvent =
	| MouseEvent< HTMLButtonElement | HTMLInputElement >
	| KeyboardEvent< HTMLButtonElement | HTMLInputElement >;

type Props< TLanguage extends Language > = {
	onSelectLanguage: ( language: TLanguage ) => void;
	languages: TLanguage[];
	languageGroups: LanguageGroup[];
	selectedLanguage?: TLanguage;
	localizedLanguageNames?: LocalizedLanguageNames;
	headingButtons?: ReactNode;
	headingTitle?: ReactNode;
};

/**
 * Pick the first language group that includes the currently selected language.
 * If no language is currently selected then just use the default. Similarly,
 * if no language group can be found with the current language in it, use the default.
 * @param selectedLanguage The currently selected language, if one exists.
 * @param languageGroups The language groups to choose from.
 * @param defaultLananguageGroupId The default language group to use when a language isn't picked or when the selected language isn't found in any of the groups.
 * @returns The best default language group id.
 */
const findBestDefaultLanguageGroupId = (
	selectedLanguage: Language | undefined,
	languageGroups: LanguageGroup[],
	defaultLananguageGroupId: string
): string => {
	if ( ! selectedLanguage ) {
		return defaultLananguageGroupId;
	}

	if ( selectedLanguage.popular ) {
		return 'popular';
	}

	return (
		languageGroups.find( ( lg ) => {
			const sharedTerritories =
				lg.subTerritories?.filter( ( territory ) =>
					selectedLanguage.territories.includes( territory )
				) ?? [];

			if ( sharedTerritories.length > 0 ) {
				return true;
			}

			return false;
		} )?.id ?? defaultLananguageGroupId
	);
};

function LanguagePicker< TLanguage extends Language >( {
	onSelectLanguage,
	languages,
	languageGroups,
	selectedLanguage,
	localizedLanguageNames,
	headingTitle,
	headingButtons,
}: Props< TLanguage > ) {
	const { __ } = useI18n();
	const [ filter, setFilter ] = useState(
		findBestDefaultLanguageGroupId( selectedLanguage, languageGroups, languageGroups[ 0 ].id )
	);
	const instanceId = useInstanceId( LanguagePicker, 'search' );

	const [ search, setSearch ] = useState( '' );
	const [ isMobileSearchOpen, setIsMobileSearchOpen ] = useState( false );
	const searchInput = useRef< HTMLInputElement >( null );
	const getFilteredLanguages = () => {
		switch ( filter ) {
			case 'popular':
				return languages
					.filter( ( language ) => language.popular )
					.sort( ( a, b ) => ( a.popular as number ) - ( b.popular as number ) );
			default: {
				const languageGroup = languageGroups.find( ( l ) => l.id === filter );
				const subTerritories = languageGroup ? languageGroup.subTerritories : [];
				return languages
					.filter( ( language ) =>
						language.territories.some( ( t ) => subTerritories?.includes( t ) )
					)
					.sort( ( a, b ) => a.name.localeCompare( b.name ) );
			}
		}
	};

	const renderCategoryButtons = () => {
		return languageGroups.map( ( languageGroup ) => {
			const isSelected = filter === languageGroup.id;

			const onClick = () => {
				setFilter( languageGroup.id );
			};

			return (
				<Button
					key={ languageGroup.id }
					onClick={ onClick }
					className="language-picker-component__language-group"
				>
					<span className={ isSelected ? 'is-selected' : '' }>{ languageGroup.name() }</span>
				</Button>
			);
		} );
	};

	const shouldDisplayRegions = ! search;

	const languagesToRender = search
		? getSearchedLanguages( languages, search, localizedLanguageNames )
		: getFilteredLanguages();

	const selectControlOptions = languageGroups.map( ( lg ) => ( { key: lg.id, name: lg.name() } ) );

	const handleSearchClose = useCallback( () => {
		setFilter( findBestDefaultLanguageGroupId( selectedLanguage, languageGroups, filter ) );
	}, [ selectedLanguage, languageGroups, filter ] );

	const searchPlaceholder = __( 'Search languages…' );

	const openMobileSearch = ( event: KeyboardOrMouseEvent ) => {
		event.preventDefault();

		setIsMobileSearchOpen( true );
		searchInput.current?.focus();
	};
	useEffect( () => {
		if ( searchInput.current && isMobileSearchOpen ) {
			searchInput.current.focus();
		}
		if ( ! isMobileSearchOpen ) {
			searchInput.current?.blur();
		}
	}, [ isMobileSearchOpen ] );

	const closeMobileSearch = ( event: KeyboardOrMouseEvent ) => {
		if ( event.type === 'keydown' && 'key' in event && event.key !== 'Enter' ) {
			return;
		}
		event.preventDefault();
		// if clicked or pressed enter we reset the form
		setSearch( '' );
		setIsMobileSearchOpen( false );
		handleSearchClose();
	};
	return (
		<VStack alignment="left" className="language-picker-component">
			<VStack className="language-picker-component__heading">
				<VStack alignment="left" justify="space-between">
					<VStack className="language-picker-component__title wp-brand-font">
						{ headingTitle || __( 'Select a language', __i18n_text_domain__ ) }
					</VStack>
					{ headingButtons && (
						<VStack className="language-picker-component__heading-buttons">
							{ headingButtons }
						</VStack>
					) }
				</VStack>
			</VStack>
			<HStack className="language-picker-component__search" spacing={ 0 }>
				<CustomSelectControl
					label={ __( 'regions' ) }
					hideLabelFromVision
					value={ selectControlOptions.find( ( option ) => option.key === filter ) }
					options={ selectControlOptions }
					onChange={ ( {
						selectedItem,
					}: {
						selectedItem: ( typeof selectControlOptions )[ number ];
					} ) => selectedItem && setFilter( selectedItem.key ) }
				/>
				<div
					className={
						'language-picker-component__search-mobile ' +
						( isMobileSearchOpen ? ' is-search-open' : '' )
					}
				>
					<SearchControl
						__nextHasNoMarginBottom
						onChange={ setSearch }
						label={ __( 'Search', __i18n_text_domain__ ) }
						hideLabelFromVision
						value={ search }
						id={ 'search-component-' + instanceId }
						className="search-component__input"
						placeholder={ searchPlaceholder }
						ref={ searchInput }
						size="compact"
					/>
					<Button
						className="search-component__icon-navigation-open"
						onClick={ openMobileSearch }
						tabIndex={ isMobileSearchOpen ? 0 : -1 }
						onKeyDown={ openMobileSearch }
						aria-controls={ 'search-component-' + instanceId }
						aria-label={ __( 'Open Search', __i18n_text_domain__ ) }
					>
						<Icon icon={ searchIcon } className="search-component__mobile-open-icon" size={ 30 } />
					</Button>
					<Button
						className="search-component__icon-navigation-close"
						onClick={ closeMobileSearch }
						onKeyDown={ closeMobileSearch }
						aria-controls={ 'search-component-' + instanceId }
						aria-label={ __( 'Close Search', __i18n_text_domain__ ) }
					>
						<Icon icon={ closeIcon } className="search-component__mobile-close-icon" />
					</Button>
				</div>
				<div className="language-picker-component__search-desktop">
					<SearchControl
						__nextHasNoMarginBottom
						onChange={ setSearch }
						label={ __( 'Search', __i18n_text_domain__ ) }
						hideLabelFromVision
						placeholder={ searchPlaceholder }
					/>
				</div>
			</HStack>
			<HStack className="language-picker-component__labels" expanded={ false } spacing={ 0 }>
				{ shouldDisplayRegions ? (
					<>
						<div className="language-picker-component__regions-label">{ __( 'regions' ) }</div>
						<div className="language-picker-component__languages-label">{ __( 'languages' ) }</div>
					</>
				) : (
					<div className="language-picker-component__search-results-label">
						{ __( 'Search results' ) }
					</div>
				) }
			</HStack>

			<HStack className="language-picker-component__content" alignment="top-left" spacing={ 0 }>
				{ shouldDisplayRegions && (
					<VStack className="language-picker-component__category-filters">
						{ renderCategoryButtons() }
					</VStack>
				) }
				<HStack alignment="top-left" wrap spacing={ 0 } justify="flex-start">
					{ languagesToRender.map( ( language ) => (
						<Button
							variant={ language.langSlug === selectedLanguage?.langSlug ? 'primary' : undefined }
							className="language-picker-component__language-button"
							key={ language.langSlug }
							onClick={ () => onSelectLanguage( language ) }
							title={ language.name }
						>
							<span lang={ language.langSlug }>{ language.name }</span>
						</Button>
					) ) }
				</HStack>
			</HStack>
		</VStack>
	);
}

export default LanguagePicker;
