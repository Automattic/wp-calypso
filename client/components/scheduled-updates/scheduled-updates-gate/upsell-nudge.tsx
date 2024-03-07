import {
	PLAN_BUSINESS,
	getPlan,
	WPCOM_FEATURES_SCHEDULED_UPDATES,
} from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const UpsellNudgeNotice = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const titleText = translate(
		'Upgrade to the %(businessPlanName)s plan to install plugins and manage scheduled updates.',
		{
			args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
		}
	);

	const href = addQueryArgs( `/checkout/${ siteSlug }/business`, {
		redirect_to: `/plugins/scheduled-updates/${ siteSlug }`,
	} );

	return (
		<UpsellNudge
			className="scheduled-updates-upsell-nudge"
			title={ titleText }
			event="calypso_scheduled_updates_upgrade_click"
			href={ href }
			callToAction={ translate( 'Upgrade' ) }
			plan={ PLAN_BUSINESS }
			showIcon={ true }
			feature={ WPCOM_FEATURES_SCHEDULED_UPDATES }
		/>
	);
};

export default UpsellNudgeNotice;
