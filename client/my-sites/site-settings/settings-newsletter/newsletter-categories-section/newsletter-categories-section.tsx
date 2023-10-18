import { Card } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import NewsletterCategoriesToggle from './newsletter-categories-toggle';
import './style.scss';

type NewsletterCategoriesSectionProps = {
	disabled?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: () => void;
	newsletterCategoriesEnabled?: boolean;
	newsletterCategoryIds: number[];
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
	isSavingSettings: boolean;
};

const NewsletterCategoriesSection = ( {
	disabled,
	handleToggle,
	newsletterCategoriesEnabled,
	newsletterCategoryIds,
	handleSubmitForm,
	updateFields,
	isSavingSettings,
}: NewsletterCategoriesSectionProps ) => {
	const translate = useTranslate();
	const { hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

	return (
		<>
			{ /* @ts-expect-error SettingsSectionHeader is not typed and is causing errors */ }
			<SettingsSectionHeader
				id="newsletter-categories-settings"
				title={ translate( 'Newsletter categories' ) }
				showButton
				onButtonClick={ handleSubmitForm }
				disabled={ disabled }
				isSaving={ isSavingSettings }
			/>

			<Card className="site-settings__card">
				<NewsletterCategoriesToggle
					disabled={ disabled }
					handleToggle={ handleToggle }
					value={ newsletterCategoriesEnabled }
				/>
			</Card>

			<Card
				className={ classNames(
					'newsletter-categories-settings__term-tree-selector',
					'site-settings__card',
					{
						hidden: ! newsletterCategoriesEnabled,
					}
				) }
				aria-hidden={ ! newsletterCategoriesEnabled }
			>
				<TermTreeSelector
					taxonomy="category"
					addTerm={ true }
					multiple={ true }
					selected={ newsletterCategoryIds }
					onChange={ (
						category: { ID: number },
						{ target: { checked } }: React.ChangeEvent< HTMLInputElement >
					) => {
						const updatedValue = checked
							? [ ...newsletterCategoryIds, category.ID ]
							: newsletterCategoryIds.filter( ( id ) => id !== category.ID );

						updateFields( { wpcom_newsletter_categories: updatedValue } );
					} }
					onAddTermSuccess={ ( category: { ID: number } ) => {
						updateFields( {
							wpcom_newsletter_categories: [ ...newsletterCategoryIds, category.ID ],
						} );
					} }
					height={ 218 }
				/>
				<FormSettingExplanation className="newsletter-categories-settings__description">
					{ isEnglishLocale ||
					hasTranslation(
						'When you add a new category, your existing subscribers will be automatically subscribed to it.'
					)
						? translate(
								'When you add a new category, your existing subscribers will be automatically subscribed to it.'
						  )
						: translate(
								'When adding a new newsletter category, your subscribers will be automatically subscribed to it. They won’t receive any email notification when the category is created.'
						  ) }
				</FormSettingExplanation>
			</Card>
		</>
	);
};

export default NewsletterCategoriesSection;
