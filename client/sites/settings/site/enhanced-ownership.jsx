import {
	WPCOM_FEATURES_LOCKED_MODE,
	WPCOM_FEATURES_LEGACY_CONTACT,
} from '@automattic/calypso-products/src';
import { Button, Card, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

// Add settings for enhanced ownership: ability to enable locked mode and add the name of a person who will inherit the site.
export default function EnhancedOwnershipForm( {
	fields,
	onChangeField,
	handleToggle,
	isSaving,
	onSave,
	disabled,
	eventTracker,
	uniqueEventTracker,
} ) {
	const translate = useTranslate();
	const hasLockedMode = useSelectedSiteSelector( siteHasFeature, WPCOM_FEATURES_LOCKED_MODE );
	const hasLegacyContact = useSelectedSiteSelector( siteHasFeature, WPCOM_FEATURES_LEGACY_CONTACT );
	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

	// if has neither locked mode nor legacy contact, return
	if ( ! hasLockedMode && ! hasLegacyContact ) {
		return;
	}

	const renderForm = () => {
		return (
			<form>
				{ hasLegacyContact && (
					<FormFieldset className="site-settings__enhanced-ownership-content">
						<FormFieldset>
							<FormLabel htmlFor="legacycontact">{ translate( 'Legacy contact' ) }</FormLabel>
							<FormInput
								name="legacycontact"
								id="legacycontact"
								data-tip-target="legacy-contact-input"
								value={ fields.wpcom_legacy_contact || '' }
								onChange={ onChangeField( 'wpcom_legacy_contact' ) }
								disabled={ disabled }
								onClick={ eventTracker( 'Clicked Legacy Contact Field' ) }
								onKeyPress={ uniqueEventTracker( 'Typed in Legacy Contact Field' ) }
							/>
						</FormFieldset>
						<FormSettingExplanation>
							{ translate( 'Choose someone to look after your site when you pass away.' ) }
						</FormSettingExplanation>
						<FormSettingExplanation>
							{ translate(
								'To take ownership of the site, we ask that the person you designate contacts us at {{a}}wordpress.com/help{{/a}} with a copy of the death certificate.',
								{
									components: {
										a: (
											<a
												href="https://wordpress.com/help"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
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

	if ( ! isUntangled ) {
		return (
			<div className="site-settings__enhanced-ownership-container">
				<SettingsSectionHeader
					title={ translate( 'Control your legacy' ) }
					id="site-settings__enhanced-ownership-header"
					disabled={ disabled }
					isSaving={ isSaving }
					onButtonClick={ onSave }
					showButton
				/>
				<Card>{ renderForm() }</Card>
			</div>
		);
	}

	return (
		<PanelCard>
			<PanelCardHeading>{ translate( 'Control your legacy' ) }</PanelCardHeading>
			{ renderForm() }
			<Button busy={ isSaving } disabled={ disabled } onClick={ onSave }>
				{ translate( 'Save' ) }
			</Button>
		</PanelCard>
	);
}
