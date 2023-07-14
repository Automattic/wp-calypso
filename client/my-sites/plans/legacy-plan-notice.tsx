import { isBlogger, isPersonal, isPremium } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Renders a "You're on a legacy plan" for sites on legacy plans (excluding free, business, and ecommerce plan).
 */
const LegacyPlanNotice = ( {
	eligibleForProPlan,
	plan,
}: {
	eligibleForProPlan: boolean;
	plan: SiteDetails[ 'plan' ];
} ) => {
	const translate = useTranslate();
	const eligibleLegacyPlan =
		plan && ( isBlogger( plan ) || isPersonal( plan ) || isPremium( plan ) );

	if ( eligibleForProPlan && eligibleLegacyPlan ) {
		return (
			<Notice
				status="is-info"
				text={ translate(
					'You’re currently on a legacy plan. If you’d like to learn about your eligibility to switch to a Pro plan please contact support.'
				) }
				icon="info-outline"
				showDismiss={ false }
			></Notice>
		);
	}
	return null;
};

export default LegacyPlanNotice;
