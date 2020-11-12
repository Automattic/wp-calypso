/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFreePlan } from 'calypso/lib/plans';
import { getSite } from 'calypso/state/sites/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

export const siteHasPaidPlan = ( selectedSite ) =>
	selectedSite && selectedSite.plan && ! isFreePlan( selectedSite.plan.product_slug );

export class SitePickerSubmit extends React.Component {
	UNSAFE_componentWillMount() {
		const { stepSectionName, stepName, goToStep, selectedSite } = this.props;
		const hasPaidPlan = siteHasPaidPlan( selectedSite );
		const { ID: siteId, slug: siteSlug } = selectedSite;

		this.props.submitSignupStep( {
			stepName,
			stepSectionName,
			siteId,
			siteSlug,
		} );

		this.props.submitSignupStep(
			{ stepName: 'themes', wasSkipped: true },
			{ themeSlugWithRepo: 'pub/twentysixteen' }
		);

		if ( hasPaidPlan ) {
			this.props.submitSignupStep(
				{ stepName: 'plans-site-selected', wasSkipped: true },
				{ cartItem: null }
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
	( state, ownProps ) => ( {
		selectedSite: getSite( state, ownProps.siteSlug ),
	} ),
	{ submitSignupStep }
)( SitePickerSubmit );
