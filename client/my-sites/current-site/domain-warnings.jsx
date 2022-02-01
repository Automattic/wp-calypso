import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import DomainWarnings from 'calypso/my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteEligibleForLegacyFSE from 'calypso/state/selectors/is-site-eligible-for-legacy-fse';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const allowedRules = [
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
				allowedRules={ allowedRules }
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
		isSiteEligibleForFSE: isSiteEligibleForLegacyFSE( state, selectedSiteId ),
	};
} )( CurrentSiteDomainWarnings );
