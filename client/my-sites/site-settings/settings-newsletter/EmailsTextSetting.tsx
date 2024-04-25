import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useSelector } from 'calypso/state';
import {
	isJetpackMinimumVersion,
	isJetpackSite as isJetpackSiteSelector,
} from 'calypso/state/sites/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import { SubscriptionOptions } from '../settings-reading/main';
import type { AppState } from 'calypso/types';

type EmailsTextSettingProps = {
	value?: SubscriptionOptions;
	disabled?: boolean;
	updateFields: ( fields: { [ key: string ]: unknown } ) => void;
};

type SubscriptionOption = {
	[ key: string ]: string;
};

export const EmailsTextSetting = ( { value, disabled, updateFields }: EmailsTextSettingProps ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID;

	const isJetpackSite = useSelector( ( state ) => isJetpackSiteSelector( state, siteId ) );
	const isJetpackVersionSupported = useSelector( ( state: AppState ) => {
		return siteId && isJetpackSite && isJetpackMinimumVersion( state, siteId, '12.8-a.11' );
	} );

	// isJetpackSite applies for both Atomic & self-hosted Jetpack,
	// it needs to meet the minimum version 12.8-a.11 at least.
	const hasWelcomeEmailFeature = ! isJetpackSite || ( isJetpackSite && isJetpackVersionSupported );

	const updateSubscriptionOptions =
		( option: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const textAreaValue = event.target.value;
			const currentSubscriptionOptions = value;

			const newSubscriptionOption: SubscriptionOption = {};
			newSubscriptionOption[ option ] = textAreaValue;

			const mergedOptions = { ...currentSubscriptionOptions, ...newSubscriptionOption };
			const fieldToUpdate = {
				subscription_options: mergedOptions,
			};

			updateFields( fieldToUpdate );
		};

	return (
		<div className="site-settings__emails-text-settings-container">
			<FormFieldset>
				<FormLegend>
					{ translate( 'These settings change the emails sent from your site to your readers' ) }
				</FormLegend>
				{ hasWelcomeEmailFeature && (
					<>
						<FormLabel htmlFor="welcome_email_message">
							{ translate( 'Welcome email message' ) }
						</FormLabel>
						<FormTextarea
							name="welcome_email_message"
							id="welcome_email_message"
							value={ value?.welcome || '' }
							onChange={ updateSubscriptionOptions( 'welcome' ) }
							disabled={ disabled }
							autoCapitalize="none"
						/>
						<FormSettingExplanation>
							{ translate( 'The email sent out when someone confirms their subscription.' ) }
						</FormSettingExplanation>
					</>
				) }
			</FormFieldset>
		</div>
	);
};
