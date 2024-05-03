import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

function usePostByVoiceSettings() {
	return {
		enabled: false,
	};
}

function usePostByVoiceMutation() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return { mutate: ( value: boolean ) => {} };
}

type PostByVoiceSettingProps = {
	isRequestingSettings: boolean;
	isSavingSettings: boolean;
};

export function PostByVoiceSetting( {
	isRequestingSettings,
	isSavingSettings,
}: PostByVoiceSettingProps ) {
	const isFormPending = isRequestingSettings || isSavingSettings;
	const translate = useTranslate();
	const postByVoiceData = usePostByVoiceSettings();
	const { mutate } = usePostByVoiceMutation();

	return (
		<div>
			<SettingsSectionHeader title={ translate( 'Post by Voice' ) } />

			<Card>
				<SupportInfo
					text={ translate(
						'Post by Voice is a way to publish audio posts to your blog with a phone call.'
					) }
					link={ localizeUrl( 'https://wordpress.com/support/post-by-voice/' ) }
					privacyLink={ false }
				/>

				<ToggleControl
					checked={ postByVoiceData.enabled }
					disabled={ isFormPending }
					label={ translate( 'Enable Post by Voice' ) }
					onChange={ ( checked ) => {
						mutate( checked );
					} }
				/>

				<FormSettingExplanation isIndented>
					{ translate( 'Post audio recordings to your blog by placing a phone call.' ) }
				</FormSettingExplanation>
			</Card>
		</div>
	);
}
