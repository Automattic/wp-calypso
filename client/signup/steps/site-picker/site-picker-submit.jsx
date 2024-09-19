import config from '@automattic/calypso-config';
import { isFreePlan } from '@automattic/calypso-products';
import { Component } from 'react';
import { connect } from 'react-redux';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSite } from 'calypso/state/sites/selectors';

/**
 * @param {null|undefined|{plan?: {product_slug: string}}} selectedSite
 * @returns {boolean}
 */
export const siteHasPaidPlan = ( selectedSite ) =>
	Boolean( selectedSite && selectedSite.plan && ! isFreePlan( selectedSite.plan.product_slug ) );

export class SitePickerSubmit extends Component {
	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		const { stepSectionName, stepName, goToStep, selectedSite } = this.props;
		const hasPaidPlan = siteHasPaidPlan( selectedSite );
		const { ID: siteId, slug: siteSlug } = selectedSite;

		this.props.submitSignupStep(
			{
				stepName,
				stepSectionName,
				siteId,
				siteSlug,
			},
			{ themeSlugWithRepo: 'pub/twentysixteen' }
		);

		if ( hasPaidPlan ) {
			this.props.submitSignupStep(
				{ stepName: 'plans-site-selected', wasSkipped: true },
				{ cartItems: null, themeSlugWithRepo: 'pub/twentysixteen' }
			);

			goToStep( config.isEnabled( 'signup/social-first' ) ? 'user-social' : 'user' );
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
