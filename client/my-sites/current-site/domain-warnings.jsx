/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainWarnings from 'client/my-sites/domains/components/domain-warnings';
import { getDecoratedSiteDomains } from 'client/state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';
import QuerySiteDomains from 'client/components/data/query-site-domains';

const ruleWhiteList = [
	'unverifiedDomainsCanManage',
	'unverifiedDomainsCannotManage',
	'expiredDomainsCanManage',
	'expiringDomainsCanManage',
	'expiredDomainsCannotManage',
	'expiringDomainsCannotManage',
	'wrongNSMappedDomains',
	'pendingGappsTosAcceptanceDomains',
	'transferStatus',
];

const CurrentSiteDomainWarnings = ( { domains, isJetpack, selectedSite } ) => {
	if ( ! selectedSite || isJetpack ) {
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
			/>
		</div>
	);
};

CurrentSiteDomainWarnings.propTypes = {
	domains: PropTypes.array,
	isJetpack: PropTypes.bool,
	selectedSite: PropTypes.object,
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		domains: getDecoratedSiteDomains( state, selectedSiteId ),
		isJetpack: isJetpackSite( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
	};
} )( CurrentSiteDomainWarnings );
