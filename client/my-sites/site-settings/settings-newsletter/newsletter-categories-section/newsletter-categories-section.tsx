import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import NewsletterCategoriesToggle from './newsletter-categories-toggle';
import './style.scss';

type NewsletterCategoriesSectionProps = {
	disabled?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	newsletterCategoriesEnabled?: boolean;
	newsletterCategoryIds: number[];
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

const NewsletterCategoriesSection = ( {
	disabled,
	handleToggle,
	newsletterCategoriesEnabled,
	newsletterCategoryIds,
	updateFields,
}: NewsletterCategoriesSectionProps ) => {
	const translate = useTranslate();

	return (
		<>
			<Card className="site-settings__card">
				<NewsletterCategoriesToggle
					disabled={ disabled }
					handleToggle={ handleToggle }
					value={ newsletterCategoriesEnabled }
				/>
			</Card>

			<Card
				className={ clsx(
					'newsletter-categories-settings__term-tree-selector',
					'site-settings__card',
					{
						hidden: ! newsletterCategoriesEnabled,
					}
				) }
				aria-hidden={ ! newsletterCategoriesEnabled }
			>
				<FormLegend>
					{ translate(
						'Which categories will you use for newsletter subscribers? Select all that apply:'
					) }
				</FormLegend>
				<TermTreeSelector
					taxonomy="category"
					addTerm
					multiple
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
					{ translate(
						'When you add a new category, your existing subscribers will be automatically subscribed to it.'
					) }
				</FormSettingExplanation>
			</Card>
		</>
	);
};

export default NewsletterCategoriesSection;
