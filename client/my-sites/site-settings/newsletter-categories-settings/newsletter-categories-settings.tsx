import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import TermTreeSelector from 'calypso/blocks/term-tree-selector';
import { useNewsletterCategoriesQuery } from 'calypso/data/newsletter-categories';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const NewsletterCategoriesSettings = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const { data } = useNewsletterCategoriesQuery( { siteId } );
	const newsletterCategoryIds = useMemo(
		() => data?.newsletterCategories?.map( ( { id } ) => id ) ?? [],
		[ data ]
	);

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
				onChange={ () => undefined }
				onAddTermSuccess={ () => undefined }
				height={ 218 }
			/>
		</div>
	);
};

export default NewsletterCategoriesSettings;
