/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { getSite } from 'state/sites/selectors';
import SiteSelector from 'components/site-selector';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';

class SitePicker extends Component {
	handleSiteSelect = ( siteSlug ) => {
		const {
				stepSectionName,
				stepName,
				goToStep,
			} = this.props,
			site = this.props.getSelectedSite( siteSlug ),
			hasPlan = site && site.plan && site.plan.product_slug !== 'free_plan';

		SignupActions.submitSignupStep(
			{
				stepName,
				stepSectionName,
				siteId: site.ID,
				siteSlug: site.slug
			},
			[],
			{}
		);

		SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
			themeSlugWithRepo: 'pub/twentysixteen'
		} );

		if ( hasPlan ) {
			SignupActions.submitSignupStep( { stepName: 'plans', wasSkipped: true }, [], { cartItem: null, privacyItem: null } );

			goToStep( 'user' );
		} else {
			goToStep( 'plans' );
		}
	};

	filterSites = ( site ) => {
		return site.capabilities.manage_options && ! site.jetpack;
	};

	renderScreen() {
		return (
			<Card className="site-picker__wrapper">
				<SiteSelector
					filter={ this.filterSites }
					onSiteSelect={ this.handleSiteSelect }
				/>
			</Card>
		);
	}

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.headerText }
				fallbackSubHeaderText={ this.props.subHeaderText }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderScreen() } />
		);
	}
}

export default connect(
	( state ) => {
		return {
			getSelectedSite: ( siteId ) => getSite( state, siteId )
		};
	}
)( SitePicker );
