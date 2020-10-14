/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Style dependencies
 */
import './style.scss';

export type LanguageGroup = {
	id: string;
	name: () => string;
	subTerritories?: string[];
	countries?: string[];
	default?: boolean;
};

type LanguageSlug = string;
type WPLocale = string;

type BaseLanguage = {
	langSlug: LanguageSlug;
	name: string;
	popular?: number;
	rtl?: boolean;
	territories: string[];
	value: number;
	wpLocale: WPLocale | '';
};

type SubLanguage = BaseLanguage & { parentLangSlug: string };

export type Language = BaseLanguage | SubLanguage;

type Props = {
	onSelectLanguage: ( language: Language ) => void;
	languages: Language[];
	languageGroups: LanguageGroup[];
	defaultLananguageGroupId: string;
};

const LanguagePicker = ( {
	onSelectLanguage,
	languages,
	languageGroups,
	defaultLananguageGroupId,
}: Props ) => {
	const [ filter, setFilter ] = useState( defaultLananguageGroupId );

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
				<div key={ languageGroup.id }>
					<Button onClick={ onClick } className="language-picker__language-group">
						<span className={ isSelected ? 'is-selected' : '' }>{ languageGroup.name() }</span>
					</Button>
				</div>
			);
		} );
	};

	return (
		<>
			<div className="language-picker__regions-label">{ __( 'regions' ) }</div>
			<div className="language-picker__content">
				<div className="language-picker__category-filters">{ renderCategoryButtons() }</div>
				<div className="language-picker__language-buttons">
					{ getFilteredLanguages().map( ( language ) => (
						<Button
							className="language-picker__language-button"
							key={ language.langSlug }
							onClick={ () => onSelectLanguage( language ) }
							title={ language.name }
						>
							<span lang={ language.langSlug }>{ language.name }</span>
						</Button>
					) ) }
				</div>
			</div>
		</>
	);
};

export default LanguagePicker;
