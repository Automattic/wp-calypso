/** @format */

/**
 * Internal dependencies
 */
import { getGSuiteSupportedPrimaryDomainName } from 'lib/gsuite';
import { getEmailTypeForDomainName } from 'state/selectors/get-email-forwarding-type';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';

/**
 * Returns true if the G Suite nudge can shown for this site if:
 *  - The GSuite stats nudge has not been dismissed
 *  - The primary domain is eligible to add GSuite ( i.e. has no GSuite or forwards already )
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The Id of the site
 * @param  {Array} domains - list of domain objects
 * @return {Boolean} true if the nudge should be visible
 */
export default function isGSuiteStatsNudgeVisible( state, siteId, domains ) {
	const supportedPrimaryDomainName = getGSuiteSupportedPrimaryDomainName( domains );
	const notDismissed = ! isGSuiteStatsNudgeDismissed( state, siteId );
	const hasValidName = !! supportedPrimaryDomainName;
	const domainCanAddGSuite =
		hasValidName && ! getEmailTypeForDomainName( state, supportedPrimaryDomainName );
	return notDismissed && domainCanAddGSuite;
}
