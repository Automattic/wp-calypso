import { smsCountryCodesQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../../components/inline-support-link';
import Notice from '../../../components/notice';
import TwoStepAuthActions from './actions';
import ApplicationPasswords from './application-passwords';
import BackupCodes from './backup-codes';
import SecurityKeys from './security-keys';
import type { UserSettings } from '@automattic/api-core';

export default function SecurityTwoStepAuthMainPage( {
	userSettings,
}: {
	userSettings: UserSettings;
} ) {
	const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );

	const {
		two_step_app_enabled,
		two_step_sms_enabled,
		two_step_sms_phone_number,
		two_step_sms_country,
	} = userSettings;

	const initialCountryCode = two_step_sms_country;
	const countryCode = smsCountryCodes.find(
		( countryCode ) => countryCode.code === initialCountryCode
	);
	const phoneNumber =
		two_step_sms_enabled && countryCode
			? `${ countryCode.numeric_code } ${ two_step_sms_phone_number }`
			: two_step_sms_phone_number;

	return (
		<VStack spacing={ 8 }>
			<Notice variant="info" title={ __( 'Two-step authentication is enabled' ) }>
				{ two_step_sms_enabled &&
					sprintf(
						/* translators: %s is the phone number */
						__(
							'You‘re all set to receive authentication codes at %s. Want to use a different number? Just disable two-step authentication and set it up again using the new number.'
						),
						phoneNumber
					) }
				{ two_step_app_enabled &&
					createInterpolateElement(
						__(
							/* translators: followStepsLink is a link to the support article */
							'Switching to a new device? <followStepsLink>Follow these steps</followStepsLink> to avoid losing access to your account.'
						),
						{
							followStepsLink: (
								<InlineSupportLink
									supportPostId={ 39178 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/security/two-step-authentication/#moving-to-a-new-device'
									) }
								/>
							),
						}
					) }
			</Notice>
			<SecurityKeys />
			<ApplicationPasswords />
			<BackupCodes />
			<TwoStepAuthActions />
		</VStack>
	);
}
