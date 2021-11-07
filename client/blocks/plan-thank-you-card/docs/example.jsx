import { get } from 'lodash';
import { connect } from 'react-redux';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import PlanThankYouCard from '../';

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
