/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import QuerySiteDomains from 'components/data/query-site-domains';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isSiteEligibleForFullSiteEditing from 'state/selectors/is-site-eligible-for-full-site-editing';

const ruleWhiteList = [
	'unverifiedDomainsCanManage',
	'unverifiedDomainsCannotManage',
	'expiredDomainsCanManage',
	'expiringDomainsCanManage',
	'expiredDomainsCannotManage',
	'expiringDomainsCannotManage',
	'wrongNSMappedDomains',
	'pendingGSuiteTosAcceptanceDomains',
	'transferStatus',
	'newTransfersWrongNS',
	'pendingConsent',
];

const CurrentSiteDomainWarnings = ( {
	domains,
	isAtomic,
	isJetpack,
	selectedSite,
	siteIsUnlaunched,
	isSiteEligibleForFSE,
} ) => {
	if ( ! selectedSite || ( isJetpack && ! isAtomic ) ) {
		// Simple and Atomic sites. Not Jetpack sites.
		return null;
	}

	return (
		<div>
			<QuerySiteDomains siteId={ selectedSite.ID } />

			<DomainWarnings
				isCompact
				selectedSite={ selectedSite }
				domains={ domains }
				ruleWhiteList={ ruleWhiteList }
				isSiteEligibleForFSE={ isSiteEligibleForFSE }
				siteIsUnlaunched={ siteIsUnlaunched }
			/>
		</div>
	);
};

CurrentSiteDomainWarnings.propTypes = {
	domains: PropTypes.array,
	isJetpack: PropTypes.bool,
	isSiteEligibleForFSE: PropTypes.bool,
	selectedSite: PropTypes.object,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		domains: getDomainsBySiteId( state, selectedSiteId ),
		isJetpack: isJetpackSite( state, selectedSiteId ),
		isAtomic: isSiteAutomatedTransfer( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
		siteIsUnlaunched: isUnlaunchedSite( state, selectedSiteId ),
		isSiteEligibleForFSE: isSiteEligibleForFullSiteEditing( state, selectedSiteId ),
	};
} )( CurrentSiteDomainWarnings );
