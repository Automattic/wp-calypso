import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export const NEWSLETTER_CATEGORIES_MODAL_HIDDEN_ENABLED_OPTION =
	'wpcom_newsletter_categories_modal_hidden';

type NewsletterCategoriesHideModalToggleProps = {
	disabled?: boolean;
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
};

const NewsletterCategoriesHideModalToggle = ( {
	disabled,
	handleToggle,
	value = false,
}: NewsletterCategoriesHideModalToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="newsletter-categories-hide-toggle">
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( NEWSLETTER_CATEGORIES_MODAL_HIDDEN_ENABLED_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Hide category selection modal' ) }
			/>
			<FormSettingExplanation>
				{ translate( 'After subscribing, new users skip the category selection modal.' ) +
					' ' +
					translate(
						'Instead, you can manually assign the default categories within each subscriber block.'
					) }
			</FormSettingExplanation>
		</div>
	);
};

export default NewsletterCategoriesHideModalToggle;
