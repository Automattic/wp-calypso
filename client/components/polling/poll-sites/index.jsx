/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import PeriodicActionHandler from 'components/periodic-action-handler';
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';
import { requestSites, requestSite } from 'state/sites/actions';

const PollSites = ( { allSites, siteId, interval } ) => (
	<PeriodicActionHandler
		periodicActionId={ allSites ? 'fetch-AllSites' : `fetchSite-${ siteId }` }
		interval={ interval }
		actionToExecute={ allSites ? requestSites() : requestSite( siteId ) }
		skipChecker={ allSites ? isRequestingSites : partialRight( isRequestingSite, siteId ) }
		executeOnStart={ true } />
);

PollSites.propTypes = {
	allSites: PropTypes.bool,
	siteId: PropTypes.number,
	interval: PropTypes.number,
};

PollSites.defaultProps = {
	allSites: false,
	interval: 1000
};

export default PollSites;
