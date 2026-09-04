import {
	WPCOM_FEATURES_LEGACY_CONTACT,
	WPCOM_FEATURES_LOCKED_MODE,
} from '@automattic/calypso-products';
import { Button, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

// Add settings for enhanced ownership: a pointer to the account-level legacy contact, and the ability to enable locked mode.
export default function EnhancedOwnershipForm( {
	fields,
	handleToggle,
	isSaving,
	onSave,
	disabled,
} ) {
	const translate = useTranslate();
	const hasLockedMode = useSelectedSiteSelector( siteHasFeature, WPCOM_FEATURES_LOCKED_MODE );
	const hasLegacyContact = useSelectedSiteSelector( siteHasFeature, WPCOM_FEATURES_LEGACY_CONTACT );

	// if has neither locked mode nor legacy contact, return
	if ( ! hasLockedMode && ! hasLegacyContact ) {
		return;
	}

	const renderForm = () => {
		return (
			<form>
				{ hasLegacyContact && (
					<FormFieldset className="site-settings__enhanced-ownership-content">
						<FormLabel>{ translate( 'Legacy contact' ) }</FormLabel>
						<FormSettingExplanation>
							{ translate( 'Choose someone to look after your sites when you pass away.' ) }
						</FormSettingExplanation>
						<FormSettingExplanation>
							{ translate(
								'Legacy contact is now set on your WordPress.com account and applies to all of your sites. {{a}}Manage your legacy contact{{/a}}',
								{
									components: {
										a: <a href={ dashboardLink( '/me/security/legacy-contact' ) } />,
									},
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>
				) }
				{ hasLockedMode && (
					<FormFieldset className="site-settings__enhanced-ownership-content">
						<FormLabel>{ translate( 'Locked Mode' ) }</FormLabel>
						<ToggleControl
							disabled={ disabled }
							className="site-settings__locked-mode-toggle"
							label={ translate( 'Enable Locked Mode' ) }
							checked={ fields.wpcom_locked_mode }
							onChange={ handleToggle( 'wpcom_locked_mode' ) }
						/>
						<FormSettingExplanation>
							{ translate(
								'Prevents new posts and pages from being created as well as existing posts and pages from being edited, and closes comments site wide.'
							) }
						</FormSettingExplanation>
					</FormFieldset>
				) }
			</form>
		);
	};

	return (
		<PanelCard>
			<PanelCardHeading>{ translate( 'Control your legacy' ) }</PanelCardHeading>
			{ renderForm() }
			{ hasLockedMode && (
				<Button busy={ isSaving } disabled={ disabled } onClick={ onSave }>
					{ translate( 'Save' ) }
				</Button>
			) }
		</PanelCard>
	);
}
