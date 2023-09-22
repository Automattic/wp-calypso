import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
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
	const { hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

	return (
		<div className="newsletter-categories-toggle">
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( NEWSLETTER_CATEGORIES_ENABLED_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable newsletter categories' ) }
			/>
			<FormSettingExplanation>
				{ isEnglishLocale ||
				hasTranslation(
					'Newsletter categories allow visitors to subscribe only to specific topics.'
				)
					? translate(
							'Newsletter categories allow visitors to subscribe only to specific topics.'
					  ) +
					  ' ' +
					  translate(
							'When enabled, only posts published under the categories selected below will be emailed to your subscribers.'
					  )
					: translate(
							'This will allow your visitors to specifically subscribe to the selected categories. When this is enabled, only posts published under the created newsletter categories will be sent out to your subscribers.'
					  ) }
			</FormSettingExplanation>
		</div>
	);
};

export default NewsletterCategoriesToggle;
