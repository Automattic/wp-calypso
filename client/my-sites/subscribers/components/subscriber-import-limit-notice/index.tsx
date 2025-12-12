import { isJetpackFreePlan, isFreePlan } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function SubscriberImportLimitNotice( {
	selectedSite,
}: {
	selectedSite: SiteDetails;
} ) {
	const translate = useTranslate();
	const currentPlan = selectedSite?.plan?.product_slug || '';
	const isOnFreePlan = isFreePlan( currentPlan ) || isJetpackFreePlan( currentPlan );

	if ( ! selectedSite?.ID ) {
		return null;
	}

	// Show different messages based on plan type
	if ( isOnFreePlan ) {
		// Message for free plans
		return (
			<Notice status="info" isDismissible={ false } className="subscribers-import-limit-notice">
				{ translate(
					'Free plans have an import limit of 100 subscribers. {{upgradeLink}}Upgrade your plan{{/upgradeLink}} to import unlimited subscribers.',
					{
						components: {
							upgradeLink: <a href={ `/plans/${ selectedSite.slug }` } />,
						},
					}
				) }
			</Notice>
		);
	}

	// Message for paid plans
	return (
		<Notice status="info" isDismissible={ false } className="subscribers-import-limit-notice">
			{ translate(
				'Imports of more than 10,000 subscribers will go through a manual review before being added to your site.'
			) }
		</Notice>
	);
}
