import { isFreePlanProduct, isPro } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

/**
 * Renders a "You're on a legacy plan" for users on legacy plans (excluding legacy free plan users).
 *
 * @param {boolean} eligibleForProPlan - Is the user eligible for pro plan?
 * @param {number} selectedSite - Site ID.
 * @returns - Legacy plan Notice component.
 */
const maybeRenderLegacyPlanNotice = ( eligibleForProPlan, selectedSite ) => {
	if (
		eligibleForProPlan &&
		! isFreePlanProduct( selectedSite.plan ) &&
		! isPro( selectedSite.plan )
	) {
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
};

export default maybeRenderLegacyPlanNotice;
