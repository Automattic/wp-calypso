/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteSelector from 'components/site-selector';
import StepWrapper from 'signup/step-wrapper';
import { getSites } from 'state/selectors';
import sitesFactory from 'lib/sites-list';
import { setSelectedSiteId } from 'state/ui/actions';
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
				goToNextStep,
			} = this.props,
			site = sites.getSite( siteSlug ),
			hasPlan = site && site.plan && site.plan.product_slug !== 'free_plan';

		this.props.setSelectedSite( site.ID );

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

		if ( hasPlan ) {
			SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
				themeSlugWithRepo: 'pub/twentysixteen'
			} );
			SignupActions.submitSignupStep( { stepName: 'plans', wasSkipped: true }, [], { cartItem: null, privacyItem: null } );

			goToStep( 'user' );
		} else {
			goToNextStep();
		}
	}

	renderScreen() {
		return (
			<SiteSelector
				sites={ sites }
				onSiteSelect={ this.handleSiteSelect }
			/>
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
			sites: getSites( state )
		};
	},
	( dispatch ) => {
		return {
			setSelectedSite: ( siteId ) => dispatch( setSelectedSiteId( siteId ) )
		};
	}
)( SitePicker );
