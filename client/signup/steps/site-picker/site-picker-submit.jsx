/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { PLAN_FREE } from 'lib/plans/constants';
import { getSite } from 'state/sites/selectors';
import SignupActions from 'lib/signup/actions';

class SitePickerSubmit extends Component {
	componentWillMount() {
		const {
				stepSectionName,
				stepName,
				goToStep,
				selectedSite
			} = this.props,
			hasPaidPlan = selectedSite && selectedSite.plan && selectedSite.plan.product_slug !== PLAN_FREE;

		SignupActions.submitSignupStep(
			{
				stepName,
				stepSectionName,
				siteId: selectedSite.ID,
				siteSlug: selectedSite.slug
			},
			[],
			{}
		);

		SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
			themeSlugWithRepo: 'pub/twentysixteen'
		} );

		if ( hasPaidPlan ) {
			SignupActions.submitSignupStep( { stepName: 'plans', wasSkipped: true }, [], { cartItem: null, privacyItem: null } );

			goToStep( 'user' );
		} else {
			goToStep( 'plans' );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			selectedSite: getSite( state, ownProps.siteSlug )
		};
	}
)( SitePickerSubmit );
