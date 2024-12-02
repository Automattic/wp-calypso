import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_SUBSCRIPTION_GIFTING } from '@automattic/calypso-products/src';
import { Button, CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { isHostingMenuUntangled } from '../utils';

export default function SubscriptionGiftingForm( {
	fields,
	handleToggle,
	onSave,
	isSaving,
	disabled,
} ) {
	const translate = useTranslate();
	const hasSubscriptionGifting = useSelectedSiteSelector(
		siteHasFeature,
		WPCOM_FEATURES_SUBSCRIPTION_GIFTING
	);
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );

	if ( ! isEnabled( 'subscription-gifting' ) || ! hasSubscriptionGifting || isWpcomStagingSite ) {
		return;
	}

	const isUntangled = isHostingMenuUntangled();

	const renderForm = () => {
		return (
			<>
				<ToggleControl
					disabled={ disabled }
					className="site-settings__gifting-toggle"
					label={ translate( 'Allow site visitors to gift your plan and domain renewal costs' ) }
					checked={ fields.wpcom_gifting_subscription }
					onChange={ handleToggle( 'wpcom_gifting_subscription' ) }
				/>
				{ ! isUntangled && (
					<FormSettingExplanation>
						{ translate(
							"Allow a site visitor to cover the full cost of your site's WordPress.com plan. {{a}}Learn more{{/a}}",
							{
								components: {
									a: <InlineSupportLink supportContext="gift-a-subscription" showIcon={ false } />,
								},
							}
						) }
					</FormSettingExplanation>
				) }
			</>
		);
	};

	if ( ! isUntangled ) {
		return (
			<div className="site-settings__gifting-container">
				<SettingsSectionHeader
					title={ translate( 'Accept a gift subscription' ) }
					id="site-settings__gifting-header"
					disabled={ disabled }
					isSaving={ isSaving }
					onButtonClick={ onSave }
					showButton
				/>
				<CompactCard className="site-settings__gifting-content">{ renderForm() }</CompactCard>
			</div>
		);
	}

	return (
		<PanelCard>
			<PanelCardHeading>{ translate( 'Accept a gift subscription' ) }</PanelCardHeading>
			<PanelCardDescription>
				{ translate(
					"Allow a site visitor to cover the full cost of your site's WordPress.com plan. {{a}}Learn more{{/a}}",
					{
						components: {
							a: <InlineSupportLink supportContext="gift-a-subscription" showIcon={ false } />,
						},
					}
				) }
			</PanelCardDescription>
			{ renderForm() }
			<Button busy={ isSaving } disabled={ disabled } onClick={ onSave }>
				{ translate( 'Save' ) }
			</Button>
		</PanelCard>
	);
}
