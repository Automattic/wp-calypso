import { WPCOM_FEATURES_SUBSCRIPTION_GIFTING } from '@automattic/calypso-products/src';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

export default function SubscriptionGiftingForm( { fields, handleAutosavingToggle, disabled } ) {
	const translate = useTranslate();
	const hasSubscriptionGifting = useSelectedSiteSelector(
		siteHasFeature,
		WPCOM_FEATURES_SUBSCRIPTION_GIFTING
	);
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );

	if ( ! hasSubscriptionGifting || isWpcomStagingSite ) {
		return;
	}

	const renderForm = () => {
		return (
			<>
				<ToggleControl
					disabled={ disabled }
					className="site-settings__gifting-toggle"
					label={ translate( 'Allow site visitors to gift your plan and domain renewal costs' ) }
					checked={ fields.wpcom_gifting_subscription }
					onChange={ handleAutosavingToggle( 'wpcom_gifting_subscription' ) }
					__next40pxDefaultSize
				/>
			</>
		);
	};

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
		</PanelCard>
	);
}
