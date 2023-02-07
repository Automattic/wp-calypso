import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Whether the user is in the Domain sidebar upsell experiment.
 *
 * @returns {boolean} Whether the user is in the Domain sidebar upsell experiment.
 */
export const isDomainSidebarExperimentUser = ( state ) => {
	const currentUser = getCurrentUser( state );
	const domainAndPlanPackage = getCurrentQueryArguments( state ).domainAndPlanPackage;

	return domainAndPlanPackage && 'treatment' === currentUser?.calypso_sidebar_upsell_experiment;
};
