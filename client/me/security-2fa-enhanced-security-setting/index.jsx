import { Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SectionHeader from 'calypso/components/section-header';
import { useSelector } from 'calypso/state';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { saveUserSettings, setUserSetting } from 'calypso/state/user-settings/actions';

const Security2faEnhancedSecuritySetting = () => {
	const userSettings = useSelector( getUserSettings );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const toggleSetting = ( settingValue ) => {
		dispatch( setUserSetting( 'two_step_enhanced_security', settingValue ) );
	};

	if ( ! userSettings.two_step_security_key_enabled ) {
		return null;
	}
	return (
		<div className="security-2fa-enhanced-security-setting">
			<SectionHeader label={ translate( 'Two Factor Settings' ) }></SectionHeader>
			<Card>
				<form onChange={ () => dispatch( saveUserSettings() ) }>
					<FormFieldset>
						<FormLabel>{ translate( 'Enhanced account security' ) }</FormLabel>
						<ToggleControl
							label={ translate(
								'Secure your account by requiring the use of security keys (passkeys) as second factor.'
							) }
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

export default Security2faEnhancedSecuritySetting;
