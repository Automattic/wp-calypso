import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import NewsletterCategoriesToggle from './newsletter-categories-toggle';
import useNewsletterCategoriesSettings from './use-newsletter-categories-settings';
import './style.scss';

type NewsletterCategoriesSettingsProps = {
	disabled?: boolean;
	handleAutosavingToggle: ( field: string ) => ( value: boolean ) => void;
	toggleValue?: boolean;
};

const NewsletterCategoriesSettings = ( {
	disabled,
	handleAutosavingToggle,
	toggleValue,
}: NewsletterCategoriesSettingsProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const { isSaving, newsletterCategoryIds, handleCategoryToggle, handleSave } =
		useNewsletterCategoriesSettings( siteId );

	return (
		<div className="newsletter-categories-settings">
			<NewsletterCategoriesToggle
				disabled={ disabled }
				handleAutosavingToggle={ handleAutosavingToggle }
				value={ toggleValue }
			/>

			{ toggleValue && (
				<>
					<TermTreeSelector
						taxonomy="category"
						addTerm={ true }
						multiple={ true }
						selected={ newsletterCategoryIds }
						onChange={ handleCategoryToggle }
						onAddTermSuccess={ handleCategoryToggle }
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
						disabled={ isSaving || disabled }
						className="newsletter-categories-settings__save-button"
						onClick={ handleSave }
					>
						{ translate( 'Save settings' ) }
					</Button>
				</>
			) }
		</div>
	);
};

export default NewsletterCategoriesSettings;
