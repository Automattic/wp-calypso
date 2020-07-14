/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import ActionButtons, { BackButton } from '../../components/action-buttons';
import { Title } from '../../components/titles';
import { ChangeLocaleContextConsumer } from '../../components/locale-context';
import { languages, Language } from '../../../../languages.js';
import {
	LANGUAGE_GROUPS,
	DEFAULT_LANGUAGE_GROUP,
} from '../../../../components/language-picker/constants';
/**
 * Style dependencies
 */
const LanguageStep: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const [ filter, setFilter ] = React.useState< string >( DEFAULT_LANGUAGE_GROUP );

	const history = useHistory();

	const goBack = () => {
		history.goBack();
	};

	const getFilteredLanguages = () => {
		switch ( filter ) {
			case 'popular':
				return languages
					.filter( ( language: Language ) => language.popular )
					.sort(
						( a: Language, b: Language ) => ( a.popular as number ) - ( b.popular as number )
					);
			default: {
				const languageGroup = LANGUAGE_GROUPS.find( ( l ) => l.id === filter );
				const subTerritories = languageGroup ? languageGroup.subTerritories : null;
				return languages
					.filter( ( language: Language ) =>
						language.territories.some( ( t ) => subTerritories?.includes( t ) )
					)
					.sort( ( a: Language, b: Language ) => a.name.localeCompare( b.name ) );
			}
		}
	};

	const renderCategoryButtons = () => {
		return LANGUAGE_GROUPS.map( ( languageGroup ) => {
			const isSelected = filter === languageGroup.id;

			const onClick = () => {
				setFilter( languageGroup.id );
			};
			return (
				<Button
					key={ languageGroup.id }
					className={ isSelected ? 'selected' : '' }
					onClick={ onClick }
				>
					{ languageGroup.name( __ ) }
				</Button>
			);
		} );
	};

	return (
		<ChangeLocaleContextConsumer>
			{ ( changeLocale ) => (
				<div className="gutenboarding-page language">
					<div>
						<Title>{ __( 'Select your site language' ) }</Title>
					</div>
					<div>
						<div className="language__category-filters">{ renderCategoryButtons() }</div>
						<div className="language__language-buttons">
							{ getFilteredLanguages().map( ( language: Language ) => (
								<Button
									className="language__language-item"
									key={ language.langSlug }
									onClick={ () => {
										changeLocale( language.langSlug );
										goBack();
									} }
									title={ language.name }
								>
									<span lang={ language.langSlug }>{ language.name }</span>
								</Button>
							) ) }
						</div>
					</div>

					<ActionButtons>
						<BackButton onClick={ goBack } />
					</ActionButtons>
				</div>
			) }
		</ChangeLocaleContextConsumer>
	);
};

export default LanguageStep;
