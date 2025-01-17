import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export const NEWSLETTER_CATEGORIES_ENABLED_OPTION = 'wpcom_newsletter_categories_enabled';

type NewsletterCategoriesToggleProps = {
	disabled?: boolean;
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
};

const NewsletterCategoriesToggle = ( {
	disabled,
	handleToggle,
	value = false,
}: NewsletterCategoriesToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="newsletter-categories-toggle">
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( NEWSLETTER_CATEGORIES_ENABLED_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable newsletter categories' ) }
			/>
			<FormSettingExplanation>
				{ translate(
					'Newsletter categories allow visitors to subscribe only to specific topics.'
				) +
					' ' +
					translate(
						'When enabled, only posts published under the categories selected below will be emailed to your subscribers.'
					) }
			</FormSettingExplanation>
		</div>
	);
};

export default NewsletterCategoriesToggle;
