import { ToggleControl } from '@wordpress/components';
import { useTranslate, fixMe } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';

export const FEATURED_IMAGE_IN_EMAIL_OPTION = 'wpcom_featured_image_in_email';

type FeaturedImageEmailSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
	isPrivate?: boolean;
};

export const FeaturedImageEmailSetting = ( {
	value = false,
	handleToggle,
	disabled,
	isPrivate,
}: FeaturedImageEmailSettingProps ) => {
	const translate = useTranslate();

	return (
		<>
			<ToggleControl
				checked={ isPrivate ? false : !! value }
				onChange={ handleToggle( FEATURED_IMAGE_IN_EMAIL_OPTION ) }
				disabled={ disabled || isPrivate }
				label={ translate( 'Enable featured image on your new post emails' ) }
			/>
			<FormSettingExplanation>
				{ isPrivate
					? fixMe( {
							text: 'Featured images cannot be shown in emails when your site is private, because access to your images is restricted to your site only.',
							oldCopy: translate(
								"Includes your post's featured image in the email sent out to your readers. {{link}}Learn more about the featured image{{/link}}.",
								{
									components: {
										link: <InlineSupportLink showIcon={ false } supportContext="featured-images" />,
									},
								}
							),
							newCopy: translate(
								'Featured images cannot be shown in emails when your site is private, because access to your images is restricted to your site only.'
							),
					  } )
					: translate(
							"Includes your post's featured image in the email sent out to your readers. {{link}}Learn more about the featured image{{/link}}.",
							{
								components: {
									link: <InlineSupportLink showIcon={ false } supportContext="featured-images" />,
								},
							}
					  ) }
			</FormSettingExplanation>
		</>
	);
};
