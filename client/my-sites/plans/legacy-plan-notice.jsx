import { isBlogger, isPersonal, isPremium } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

/**
 * Renders a "You're on a legacy plan" for sites on legacy plans (excluding free, business, and ecommerce plan).
 *
 * @param {boolean} eligibleForProPlan - Is the user eligible for pro plan?
 * @param {object} selectedSite - Site object from store.
 * @param {object} selectedSite.plan - The plan object nested inside the selectedSite object.
 * @returns - Legacy plan Notice component.
 */
const maybeRenderLegacyPlanNotice = ( eligibleForProPlan, { plan } ) => {
	const eligibleLegacyPlan = isBlogger( plan ) || isPersonal( plan ) || isPremium( plan );

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
};

export default maybeRenderLegacyPlanNotice;
