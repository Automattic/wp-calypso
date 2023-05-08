import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Whether the user is in the Monthly To Annual Post Purchase experiment.
 *
 * @param state {object} Global state tree.
 * @returns {boolean} Whether the user is in the Monthly To Annual Post Purchase experiment.
 */
export const isMonthlyToAnnualPostPurchaseExperimentUser = ( state ) => {
	const currentUser = getCurrentUser( state );

	return 'treatment' === currentUser?.calypso_postpurchase_upsell_monthly_to_annual_plan;
};
