import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

export const FEATURED_IMAGE_EMAIL_OPTION = 'featured_image_email_enabled';

const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

type FeaturedImageEmailSettingProps = {
	value?: boolean;
	handleToggle: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	disabled?: boolean;
};

export const FeaturedImageEmailSetting = ( {
	value = false,
	handleToggle,
	disabled,
}: FeaturedImageEmailSettingProps ) => {
	const translate = useTranslate();

	return (
		<div className="featured-image-template-toggle-settings">
			<ToggleControl
				checked={ !! value }
				onChange={ handleToggle( FEATURED_IMAGE_EMAIL_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Enable featured image on your new post emails' ) }
			/>
			<FormSettingExplanation>
				{ translate(
					"Includes your post's featured image in the email sent out to your readers."
				) }
			</FormSettingExplanation>
		</div>
	);
};
