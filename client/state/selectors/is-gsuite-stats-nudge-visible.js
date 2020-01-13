/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getEligibleGSuiteDomain } from 'lib/gsuite';
import { getEmailForwards } from 'state/selectors/get-email-forwards';
import getEmailForwardingType from 'state/selectors/get-email-forwarding-type';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';

/**
 * Determines whether the G Suite nudge can be shown for this site. It will be displayed if:
 *
 *   - The GSuite stats nudge has not been dismissed
 *   - A domain is eligible to GSuite (i.e. has not G Suite and no email forwards already)
 *
 * @param  {object} state - Global state tree
 * @param  {number} siteId - The Id of the site
 * @param  {Array}  domains - list of domain objects
 * @returns {boolean} true if the nudge should be visible
 */
export default function isGSuiteStatsNudgeVisible( state, siteId, domains ) {
	if ( isGSuiteStatsNudgeDismissed( state, siteId ) ) {
		return false;
	}

	const eligibleDomain = getEligibleGSuiteDomain( null, domains );

	if ( ! eligibleDomain ) {
		return false;
	}

	const emailForwardingType = getEmailForwardingType( state, eligibleDomain );

	if ( emailForwardingType !== null && emailForwardingType !== 'forward' ) {
		return false;
	}

	const forwards = getEmailForwards( state, eligibleDomain );

	// Prevents the nudge from appearing until the list of email forwards has loaded to avoid flickering
	if ( forwards === null ) {
		return false;
	}

	return isEmpty( forwards );
}
