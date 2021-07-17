/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getPlanClass } from '@automattic/calypso-products';
import { getSiteSlug, getSiteTitle, getSitePlanSlug } from 'calypso/state/sites/selectors';
import getRewindState from 'calypso/state/selectors/get-rewind-state';

class JetpackBenefits extends React.Component {
	render() {
		// depending on the plan, show various benefits
		return 'Jetpack Benefits';
	}
}

export default connect( ( state, { siteId } ) => {
	const planSlug = getSitePlanSlug( state, siteId );
	const planClass = planSlug ? getPlanClass( planSlug ) : 'is-free-plan';
	const rewindState = getRewindState( state, siteId );
	return {
		plan: planClass,
		siteSlug: getSiteSlug( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
		rewindState: rewindState.state,
	};
}, {} )( localize( JetpackBenefits ) );
