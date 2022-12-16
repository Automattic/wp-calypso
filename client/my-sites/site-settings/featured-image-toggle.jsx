import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

const FeaturedImageTemplateToggle = ( props ) => {
	const { isRequestingSettings, isSavingSettings, fields, handleAutosavingToggle, translate } =
		props;
	const isDisabled = isRequestingSettings || isSavingSettings;
	const settingName = 'featured_image_email_enabled';

	return (
		<div className="featured-image-template-toggle-settings">
			<SettingsSectionHeader
				id="featured-image-template-toggle-header"
				title={ translate( 'Featured image' ) }
			/>
			<Card className="featured-image-template-toggle-card">
				<ToggleControl
					checked={ !! fields[ settingName ] }
					disabled={ isDisabled }
					onChange={ handleAutosavingToggle( settingName ) }
					label={ translate( 'Enable featured image on your new post emails' ) }
				/>
				<FormSettingExplanation>
					{ translate(
						"Includes your post's featured image in the email sent out to your readers."
					) }
				</FormSettingExplanation>
			</Card>
		</div>
	);
};

export default FeaturedImageTemplateToggle;
