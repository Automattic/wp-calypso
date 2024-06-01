import { PLAN_BUSINESS, getPlan, FEATURE_SITE_STAGING_SITES } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { CardContentWrapper } from 'calypso/my-sites/hosting/staging-site-card/card-content/card-content-wrapper';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const StagingSiteUpsellNudge = () => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) ?? 0;
	const href = addQueryArgs( `/checkout/${ siteId }/business`, {
		redirect_to: `/staging-site/${ siteId }`,
	} );

	return (
		<CardContentWrapper className="is-borderless">
			<p>
				{ translate(
					'Your staging site lets you preview and troubleshoot changes before updating the production site. {{a}}Learn more{{/a}}.',
					{
						components: {
							a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
						},
					}
				) }
			</p>
			<UpsellNudge
				className="staging-site-upsell-nudge"
				title={ translate( 'Upgrade to the %(businessPlanName)s plan to add a staging site.', {
					args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
				} ) }
				tracksImpressionName="calypso_staging_site_upgrade_impression"
				event="calypso_staging_site_upgrade_upsell"
				tracksClickName="calypso_staging_site_upgrade_click"
				href={ href }
				callToAction={ translate( 'Upgrade' ) }
				plan={ PLAN_BUSINESS }
				showIcon
				feature={ FEATURE_SITE_STAGING_SITES }
			/>
		</CardContentWrapper>
	);
};

export default StagingSiteUpsellNudge;
