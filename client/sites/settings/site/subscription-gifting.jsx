import { WPCOM_FEATURES_SUBSCRIPTION_GIFTING } from '@automattic/calypso-products';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelCard, PanelCardDescription, PanelCardHeading } from 'calypso/components/panel';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';

export default function SubscriptionGiftingForm( { fields, handleAutosavingToggle, disabled } ) {
	const translate = useTranslate();
	const hasSubscriptionGifting = useSelectedSiteSelector(
		siteHasFeature,
		WPCOM_FEATURES_SUBSCRIPTION_GIFTING
	);
	const isWpcomStagingSite = useSelectedSiteSelector( isSiteWpcomStaging );
	const siteSettings = useSelectedSiteSelector( getSiteSettings );
	const isGiftingBlocked = siteSettings?.wpcom_gifting_subscription_blocked ?? false;

	if ( ! hasSubscriptionGifting || isWpcomStagingSite ) {
		return;
	}

	const renderForm = () => {
		if ( isGiftingBlocked ) {
			return (
				<Notice
					status="is-info"
					showDismiss={ false }
					text={ translate(
						'Gift subscriptions are not available for this site because it has been identified as serving restricted content.'
					) }
				/>
			);
		}

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
