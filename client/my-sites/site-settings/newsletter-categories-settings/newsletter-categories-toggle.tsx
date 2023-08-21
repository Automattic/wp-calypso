import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export const NEWSLETTER_CATEGORIES_ENABLED_OPTION = 'wpcom_newsletter_categories_enabled';

type NewsletterCategoriesToggleProps = {
	disabled?: boolean;
	value?: boolean;
	handleAutosavingToggle: ( field: string ) => ( value: boolean ) => void;
};

const NewsletterCategoriesToggle = ( {
	disabled,
	handleAutosavingToggle,
	value = false,
}: NewsletterCategoriesToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="newsletter-categories-toggle">
			<ToggleControl
				checked={ !! value }
				onChange={ handleAutosavingToggle( NEWSLETTER_CATEGORIES_ENABLED_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable newsletter categories' ) }
			/>
			<FormSettingExplanation>
				{ translate(
					'This will allow your visitors to specifically subscribed to the selected categories. When this is enabled, only posts published under the created newsletter categories will be send out to your subscribers.'
				) }
			</FormSettingExplanation>
		</div>
	);
};

export default NewsletterCategoriesToggle;
