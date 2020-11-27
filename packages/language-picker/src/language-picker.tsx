/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { intersection } from 'lodash';
import Search from '@automattic/search';

/**
 * WordPress dependencies
 */
import { Button, CustomSelectControl, Flex, FlexBlock, FlexItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { Language, LanguageGroup } from './Language';
import { getSearchedLanguages, LocalizedLanguageNames } from './search';

/**
 * Style dependencies
 */
import './style.scss';

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
 *
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
			const sharedTerritories = intersection( lg.subTerritories, selectedLanguage.territories );

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
}: Props< TLanguage > ): JSX.Element {
	const { __ } = useI18n();
	const [ filter, setFilter ] = useState(
		findBestDefaultLanguageGroupId( selectedLanguage, languageGroups, languageGroups[ 0 ].id )
	);

	const [ search, setSearch ] = useState( '' );

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

	const handleSearchClose = React.useCallback( () => {
		setFilter( findBestDefaultLanguageGroupId( selectedLanguage, languageGroups, filter ) );
	}, [ selectedLanguage, languageGroups, filter ] );

	const searchPlaceholder = __( 'Search languages…' );

	return (
		<Flex className="language-picker-component" align="left">
			<FlexBlock className="language-picker-component__heading">
				<Flex justify="space-between" align="left">
					<FlexItem className="language-picker-component__title wp-brand-font">
						{ headingTitle || __( 'Select a language', __i18n_text_domain__ ) }
					</FlexItem>
					{ headingButtons && (
						<FlexItem className="language-picker-component__heading-buttons">
							{ headingButtons }
						</FlexItem>
					) }
				</Flex>
			</FlexBlock>
			<FlexBlock className="language-picker-component__search">
				<CustomSelectControl
					label={ __( 'regions' ) }
					hideLabelFromVision
					value={ selectControlOptions.find( ( option ) => option.key === filter ) }
					options={ selectControlOptions }
					onChange={ ( { selectedItem } ) => selectedItem && setFilter( selectedItem.key ) }
				/>
				<div className="language-picker-component__search-mobile">
					<Search
						onSearch={ setSearch }
						pinned
						fitsContainer
						placeholder={ searchPlaceholder }
						onSearchClose={ handleSearchClose }
					/>
				</div>
				<div className="language-picker-component__search-desktop">
					<Search
						openIconSide="right"
						onSearch={ setSearch }
						compact
						placeholder={ searchPlaceholder }
						onSearchClose={ handleSearchClose }
					/>
				</div>
			</FlexBlock>
			<FlexBlock className="language-picker-component__labels">
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
			</FlexBlock>
			<FlexBlock className="language-picker-component__content">
				{ shouldDisplayRegions && (
					<div className="language-picker-component__category-filters">
						{ renderCategoryButtons() }
					</div>
				) }
				<div className="language-picker-component__language-buttons">
					{ languagesToRender.map( ( language ) => (
						<Button
							isPrimary={ selectedLanguage && language.langSlug === selectedLanguage.langSlug }
							className="language-picker-component__language-button"
							key={ language.langSlug }
							onClick={ () => onSelectLanguage( language ) }
							title={ language.name }
						>
							<span lang={ language.langSlug }>{ language.name }</span>
						</Button>
					) ) }
				</div>
			</FlexBlock>
		</Flex>
	);
}

export default LanguagePicker;
