/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { PLAN_FREE } from 'lib/plans/constants';
import SignupActions from 'lib/signup/actions';
import { getSite } from 'state/sites/selectors';

class SitePickerSubmit extends React.Component {
	componentWillMount() {
		const {
				stepSectionName,
				stepName,
				goToStep,
				selectedSite
			} = this.props,
			hasPaidPlan = selectedSite && selectedSite.plan && selectedSite.plan.product_slug !== PLAN_FREE,
			{ ID: siteId, slug: siteSlug } = selectedSite;

		SignupActions.submitSignupStep(
			{
				stepName,
				stepSectionName,
				siteId,
				siteSlug
			},
			[],
			{}
		);

		SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
			themeSlugWithRepo: 'pub/twentysixteen'
		} );

		if ( hasPaidPlan ) {
			SignupActions.submitSignupStep(
				{ stepName: 'plans-site-selected', wasSkipped: true },
				[],
				{ cartItem: null, privacyItem: null }
			);

			goToStep( 'user' );
		} else {
			goToStep( 'plans-site-selected' );
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
