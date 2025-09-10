import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../../components/inline-support-link';
import Notice from '../../../components/notice';
import SecurityKeys from './security-keys';
import type { UserSettings } from '@automattic/api-core';

export default function SecurityTwoStepAuthMainPage( {
	userSettings,
}: {
	userSettings: UserSettings;
} ) {
	const { two_step_app_enabled, two_step_sms_enabled, two_step_sms_phone_number } = userSettings;

	return (
		<>
			<Notice variant="info" title={ __( 'Two-step authentication is enabled' ) }>
				{ two_step_sms_enabled &&
					sprintf(
						/* translators: %s is the phone number */
						__(
							'You‘re all set to receive authentication codes at %s. Want to use a different number? Just disable two-step authentication and set it up again using the new number.'
						),
						two_step_sms_phone_number
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
		</>
	);
}
