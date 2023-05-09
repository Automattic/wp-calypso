import { isFreePlan } from '@automattic/calypso-products';
import { Component } from 'react';
import { connect } from 'react-redux';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSite } from 'calypso/state/sites/selectors';

export const siteHasPaidPlan = ( selectedSite ) =>
	selectedSite && selectedSite.plan && ! isFreePlan( selectedSite.plan.product_slug );

export class SitePickerSubmit extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
