/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { tlds } from 'lib/domains/constants';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
// TODO: `design-type-with-store`, `design-type`, and this component could be refactored to reduce redundancy
import DomainImage from 'signup/steps/design-type-with-store/domain-image';
import PageImage from 'signup/steps/design-type-with-store/page-image';
import { getStepUrl } from 'signup/utils';

export default class SiteOrDomain extends Component {
	componentWillMount() {
		const { queryObject } = this.props;

		if ( ! queryObject || ! queryObject.new ) {
			page( getStepUrl( 'main' ) );
		}
	}

	getChoices() {
		return [
			{
				type: 'page',
				label: 'Start a new site',
				image: <PageImage />
			},
			{
				type: 'domain',
				label: 'Just buy a domain',
				image: <DomainImage />
			},
		];
	}

	renderChoices() {
		return (
			<div className="site-or-domain__choices">
				{ this.getChoices().map( ( choice ) => (
					<Card className="site-or-domain__choice" key={ choice.type }>
						<a href="#" onClick={ ( event ) => this.handleClickChoice( event, choice.type ) }>
							{ choice.image }
							<h2 className="site-or-domain__label">{ choice.label }</h2>
						</a>
					</Card>
				) ) }
			</div>
		);
	}

	handleClickChoice( event, designType ) {
		event.preventDefault();

		const {
			stepName,
			goToStep,
			goToNextStep,
			queryObject,
		} = this.props;

		const domain = queryObject.new;
		const tld = domain.split( '.' ).slice( 1 ).join( '.' );
		const domainItem = cartItems.domainRegistration( { productSlug: tlds[ tld ], domain } );

		SignupActions.submitSignupStep( { stepName, domainItem, siteSlug: domain }, [], { designType } );

		if ( designType === 'domain' ) {
			// we can skip the next two steps in the `domain-first` flow if the
			// user is only purchasing a domain
			SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
				themeSlugWithRepo: 'pub/twentysixteen'
			} );
			SignupActions.submitSignupStep( { stepName: 'plans', wasSkipped: true }, [], { cartItem: null, privacyItem: null } );
			goToStep( 'user' );
		} else {
			goToNextStep();
		}
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
				stepContent={ this.renderChoices() } />
		);
	}
}
