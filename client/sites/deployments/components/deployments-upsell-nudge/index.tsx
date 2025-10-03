import { PLAN_BUSINESS, FEATURE_SSH, getPlanBusinessTitle } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const DeploymentsUpsellNudge = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );

	const href = addQueryArgs( `/checkout/${ siteId }/business`, {
		redirect_to: `/github-deployments/${ siteId }`,
	} );

	return (
		<UpsellNudge
			className="deployments-upsell-nudge"
			title={ translate( 'Upgrade to the %(businessPlanName)s plan to use GitHub Deployments.', {
				args: { businessPlanName: getPlanBusinessTitle() },
			} ) }
			tracksImpressionName="calypso_deployments_upgrade_impression"
			event="calypso_deployments_upgrade_upsell"
			tracksClickName="calypso_deployments_upgrade_click"
			href={ href }
			callToAction={ translate( 'Upgrade' ) }
			plan={ PLAN_BUSINESS }
			showIcon
			feature={ FEATURE_SSH }
		/>
	);
};

export default DeploymentsUpsellNudge;
