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
	return <PlanThankYouCard siteId={ primarySiteId } />;
}

const ConnectedPlanThankYouCard = connect( ( state ) => {
	const primarySiteId = get( getCurrentUser( state ), 'primary_blog', null );

	return {
		primarySiteId,
	};
} )( PlanThankYouCardExample );

ConnectedPlanThankYouCard.displayName = 'PlanThankYouCard';

export default ConnectedPlanThankYouCard;
