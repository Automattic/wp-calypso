import { ToggleControl } from '@wordpress/components';
import i18n, { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';

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
				{ i18n.fixMe( {
					text: "Newsletter categories let you select the content that's emailed to subscribers. When enabled, only posts in the selected categories will be sent as newsletters. By default, subscribers can choose from your selected categories, or you can pre-select categories using the subscribe block.",
					newCopy: translate(
						"Newsletter categories let you select the content that's emailed to subscribers. When enabled, only posts in the selected categories will be sent as newsletters. By default, subscribers can choose from your selected categories, or you can pre-select categories using the {{link}}subscribe block{{/link}}.",
						{
							components: {
								link: <InlineSupportLink showIcon={ false } supportContext="subscribe-block" />,
							},
						}
					),
					oldCopy:
						translate(
							'Newsletter categories allow visitors to subscribe only to specific topics.'
						) +
						' ' +
						translate(
							'When enabled, only posts published under the categories selected below will be emailed to your subscribers.'
						),
				} ) }
			</FormSettingExplanation>
		</div>
	);
};

export default NewsletterCategoriesToggle;
