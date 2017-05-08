/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SiteSelector from 'components/site-selector';
import StepWrapper from 'signup/step-wrapper';
import sitesFactory from 'lib/sites-list';
import SignupActions from 'lib/signup/actions';

const sites = sitesFactory();

class SitePicker extends Component {
	constructor( props ) {
		super( props );

		this.handleSiteSelect = this.handleSiteSelect.bind( this );
	}

	handleSiteSelect( siteSlug ) {
		const {
				stepSectionName,
				stepName,
				goToStep,
			} = this.props,
			site = sites.getSite( siteSlug ),
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
	}

	renderScreen() {
		return (
			<Card className="site-picker__wrapper">
				<SiteSelector
					filter={
						function( site ) {
							return site.capabilities.manage_options && ! site.jetpack;
						}
					}
					sites={ sites }
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

export default SitePicker;
