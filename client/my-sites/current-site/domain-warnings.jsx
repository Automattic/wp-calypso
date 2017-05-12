/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const CurrentSiteDomainWarnings = ( { domains, isJetpack, selectedSiteId, selectedSite } ) => {
	if ( ! selectedSiteId || isJetpack ) {
		return null;
	}

	return (
		<DomainWarnings
			isCompact
			selectedSite={ selectedSite }
			domains={ domains }
			ruleWhiteList={ [
				'expiredDomainsCanManage',
				'expiringDomainsCanManage',
				'expiredDomainsCannotManage',
				'expiringDomainsCannotManage',
				'pendingGappsTosAcceptanceDomains',
				'unverifiedDomainsCanManage',
				'unverifiedDomainsCannotManage',
				'wrongNSMappedDomains',
			] }
		/>
	);
};

CurrentSiteDomainWarnings.propTypes = {
	domains: PropTypes.array,
	isJetpack: PropTypes.bool,
	selectedSite: PropTypes.object,
	selectedSiteId: PropTypes.number,
};

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			domains: getDecoratedSiteDomains( state, selectedSiteId ),
			isJetpack: isJetpackSite( state, selectedSiteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId,
		};
	}
)( CurrentSiteDomainWarnings );
