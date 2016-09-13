/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DomainToPlanNudge from '../';
import { getCurrentUser } from 'state/current-user/selectors';
import QuerySites from 'components/data/query-sites';

function DomainToPlanNudgeExample( { siteId } ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/domain-to-plan-nudge">Domain To Plan Nudge</a>
			</h2>
			<p> Warning! Clicking on "Upgrade Now" will charge your stored credit card </p>
			<QuerySites siteId={ siteId } />
			<DomainToPlanNudge siteId={ siteId } />
		</div>
	);
}

const ConnectedDomainToPlanNudge = connect( ( state ) => {
	const user = getCurrentUser( state );
	return {
		siteId: get( user, 'primary_blog', null )
	};
} )( DomainToPlanNudgeExample );

ConnectedDomainToPlanNudge.displayName = 'DomainToPlanNudge';

export default ConnectedDomainToPlanNudge;
