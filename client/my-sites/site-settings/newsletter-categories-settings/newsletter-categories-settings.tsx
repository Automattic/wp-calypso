import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useNewsletterCategoriesSettings from './use-newsletter-categories-settings';
import './style.scss';

const NewsletterCategoriesSettings = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const { newsletterCategoryIds, handleCategoryToggle, handleSave } =
		useNewsletterCategoriesSettings( siteId );

	return (
		<div className="newsletter-categories-settings">
			<p className="newsletter-categories-settings__description">
				{ translate( 'Allow your visitors to specifically subscribe to the selected categories.' ) }
			</p>

			<TermTreeSelector
				taxonomy="category"
				addTerm={ true }
				multiple={ true }
				selected={ newsletterCategoryIds }
				onChange={ handleCategoryToggle }
				onAddTermSuccess={ handleCategoryToggle }
				height={ 218 }
			/>

			<Button
				primary
				className="newsletter-categories-settings__save-button"
				onClick={ handleSave }
			>
				{ translate( 'Save settings' ) }
			</Button>
		</div>
	);
};

export default NewsletterCategoriesSettings;
