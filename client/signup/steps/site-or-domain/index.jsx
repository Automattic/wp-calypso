/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';

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
import { createNotice } from 'state/notices/actions';

class SiteOrDomain extends Component {
	componentWillMount() {
		const { queryObject } = this.props;
		let isValidDomain = queryObject && queryObject.new;

		if ( isValidDomain ) {
			const domainParts = queryObject.new.split( '.' );

			if ( domainParts.length > 1 ) {
				const tld = domainParts.slice( 1 ).join( '.' );
				isValidDomain = !! tlds[ tld ];
			} else {
				isValidDomain = false;
			}
		}

		if ( ! isValidDomain ) {
			page( getStepUrl( 'main' ) );
			defer( () => {
				this.props.createNotice( 'is-error',
					queryObject && queryObject.new
						? this.props.translate( "Unsupported domain name '%(domainName)s', you'll be able to choose domain later", {
							args: {
								domainName: queryObject.new
							}
						} )
						: this.props.translate( "You haven't provided a domain name, you'll be able to choose domain later" )
				);
			} );
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

		SignupActions.submitSignupStep( {
			stepName,
			domainItem,
			designType,
			siteSlug: domain,
			siteUrl: domain,
			isPurchasingItem: true,
		}, [], { domainItem } );

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

export default connect( null, { createNotice } )( localize( SiteOrDomain ) );
