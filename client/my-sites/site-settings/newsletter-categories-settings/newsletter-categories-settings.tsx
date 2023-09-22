import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import NewsletterCategoriesToggle from './newsletter-categories-toggle';
import './style.scss';

type NewsletterCategoriesSettingsProps = {
	disabled?: boolean;
	handleAutosavingToggle: ( field: string ) => ( value: boolean ) => void;
	handleSubmitForm: () => void;
	newsletterCategoryIds: number[];
	toggleValue?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

function ensureArray( value: unknown ): number[] {
	if ( Array.isArray( value ) ) {
		return value;
	}

	if ( typeof value === 'object' ) {
		return Object.values( value as object );
	}

	return [];
}

const NewsletterCategoriesSettings = ( {
	disabled,
	handleAutosavingToggle,
	toggleValue,
	newsletterCategoryIds,
	handleSubmitForm,
	updateFields,
}: NewsletterCategoriesSettingsProps ) => {
	const translate = useTranslate();

	const validatedNewsletterCategoryIds = ensureArray( newsletterCategoryIds );

	return (
		<div className="newsletter-categories-settings">
			<NewsletterCategoriesToggle
				disabled={ disabled }
				handleAutosavingToggle={ handleAutosavingToggle }
				value={ toggleValue }
			/>

			<div
				aria-hidden={ ! toggleValue }
				className={ classNames( 'newsletter-categories-settings__term-tree-selector', {
					hidden: ! toggleValue,
				} ) }
			>
				<TermTreeSelector
					taxonomy="category"
					addTerm={ true }
					multiple={ true }
					selected={ validatedNewsletterCategoryIds }
					onChange={ (
						category: { ID: number },
						{ target: { checked } }: React.ChangeEvent< HTMLInputElement >
					) => {
						const updatedValue = checked
							? [ ...validatedNewsletterCategoryIds, category.ID ]
							: validatedNewsletterCategoryIds.filter( ( id ) => id !== category.ID );
						updateFields( { wpcom_newsletter_categories: updatedValue } );
					} }
					onAddTermSuccess={ ( category: { ID: number } ) => {
						updateFields( {
							wpcom_newsletter_categories: [ ...validatedNewsletterCategoryIds, category.ID ],
						} );
					} }
					height={ 218 }
				/>
				<p className="newsletter-categories-settings__description">
					{ translate(
						'When adding a new newsletter category, your subscribers will be automatically subscribed to it. They won’t receive any email notification when the category is created.'
					) }
				</p>
				<Button
					primary
					compact
					disabled={ disabled }
					className="newsletter-categories-settings__save-button"
					onClick={ handleSubmitForm }
				>
					{ translate( 'Save settings' ) }
				</Button>
			</div>
		</div>
	);
};

export default NewsletterCategoriesSettings;
