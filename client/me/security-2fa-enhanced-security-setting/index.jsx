import { Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SectionHeader from 'calypso/components/section-header';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { saveUserSettings, setUserSetting } from 'calypso/state/user-settings/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { recordGoogleEvent } from '../../state/analytics/actions';

const Security2faEnhancedSecuritySetting = ( {
	userSettings,
	isFetchingSettings,
	translate,
	saveUserSettings: saveSettings,
	setUserSetting: setSetting,
} ) => {
	const toggleSetting = ( settingValue ) => {
		setSetting( 'two_step_enhanced_security', settingValue );
	};
	const onFormChange = () => {
		saveSettings();
	};

	if ( ! userSettings.two_step_security_key_enabled ) {
		return null;
	}
	return (
		<div className="security-2fa-enhanced-security-setting">
			<SectionHeader label={ translate( 'Settings' ) }></SectionHeader>
			<Card>
				<form onChange={ onFormChange }>
					<FormFieldset>
						<FormLabel>{ translate( 'Enhanced account security' ) }</FormLabel>
						<ToggleControl
							label={ translate(
								'Secure your account by requiring the use of security keys (passkeys) as second factor.'
							) }
							disabled={ isFetchingSettings }
							checked={ userSettings.two_step_enhanced_security }
							onChange={ toggleSetting }
						/>
						<FormSettingExplanation>
							{ translate(
								"Security keys (or passkeys) offer a more secure way to access your account. Whether it's a physical device or another secure method, they make it significantly harder for unauthorized users to gain access."
							) }
						</FormSettingExplanation>
					</FormFieldset>
				</form>
			</Card>
		</div>
	);
};

export default connect(
	( state ) => ( {
		userSettings: getUserSettings( state ),
		isFetchingSettings: isFetchingUserSettings( state ),
	} ),
	{
		recordGoogleEvent,
		setUserSetting,
		saveUserSettings,
	}
)( localize( Security2faEnhancedSecuritySetting ) );
