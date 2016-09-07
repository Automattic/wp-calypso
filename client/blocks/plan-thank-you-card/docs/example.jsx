/**
* External dependencies
*/
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PlanThankYouCard from '../';
import { getCurrentUser } from 'state/current-user/selectors';

function PlanThankYouCardExample( { primarySiteId } ) {
	return (
		<div className="design-assets__group">
			<h2>
				<a href="/devdocs/blocks/plan-thank-you-card">Plan Thank You Card</a>
			</h2>
			<PlanThankYouCard siteId={ primarySiteId } />
		</div>
	);
}

const ConnectedPlanThankYouCard = connect( ( state ) => {
	const primarySiteId = get( getCurrentUser( state ), 'primary_blog', null );

	return {
		primarySiteId,
	};
} )( PlanThankYouCardExample );

ConnectedPlanThankYouCard.displayName = 'PlanThankYouCard';

export default ConnectedPlanThankYouCard;
