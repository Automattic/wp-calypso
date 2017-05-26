/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import { tlds } from 'lib/domains/constants';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import SiteOrDomainChoice from './choice';
import { getCurrentUserId } from 'state/current-user/selectors';
// TODO: `design-type-with-store`, `design-type`, and this component could be refactored to reduce redundancy
import DomainImage from 'signup/steps/design-type-with-store/domain-image';
import NewSiteImage from 'signup/steps/design-type-with-store/new-site-image';
import { externalRedirect } from 'lib/route/path';
import NavigationLink from 'signup/navigation-link';

class SiteOrDomain extends Component {
	componentWillMount() {
		if ( ! this.getDomainName() ) {
			// /domains domain search is an external application to calypso,
			// therefor a full redirect required:
			externalRedirect( '/domains' );
		}
	}

	getDomainName() {
		const { queryObject, step } = this.props;

		let domain, isValidDomain = false;

		if ( queryObject && queryObject.new ) {
			domain = queryObject.new;
		} else if ( step && step.domainItem ) {
			domain = step.domainItem.meta;
		}

		if ( domain ) {
			const domainParts = domain.split( '.' );

			if ( domainParts.length > 1 ) {
				const tld = domainParts.slice( 1 ).join( '.' );
				isValidDomain = !! tlds[ tld ];
			}
		}

		return isValidDomain && domain;
	}

	getChoices() {
		const { translate } = this.props;

		const choices = [
			{
				type: 'page',
				label: translate( 'New site' ),
				image: <NewSiteImage />,
				description: translate( 'Choose a theme, customize, and launch your site. Free domain included with all plans.' )
			}
		];

		if ( this.props.isLoggedIn ) {
			choices.push(
				{
					type: 'existing-site',
					label: 'Link to an existing site',
					image: <NewSiteImage />
				}
			);
		}

		choices.push(
			{
				type: 'domain',
				label: translate( 'Just buy a domain' ),
				image: <DomainImage />,
				description: translate( 'Show a "coming soon" notice on your domain. Add a site later.' )
			}
		);

		return choices;
	}

	renderChoices() {
		return (
			<div className="site-or-domain__choices">
				{ this.getChoices().map( ( choice, index ) => (
					<SiteOrDomainChoice
						key={ `site-or-domain-choice-${ index }` }
						choice={ choice }
						handleClickChoice={ this.handleClickChoice }
					/>
				) ) }
			</div>
		);
	}

	renderBackLink() {
		// Hacky way to add back link to /domains
		return (
			<div className="site-or-domain__button">
				<NavigationLink
					direction="back"
					flowName={ this.props.flowName }
					positionInFlow={ 1 }
					stepName={ this.props.stepName }
					stepSectionName={ this.props.stepSectionName }
					backUrl="/domains"
					signupProgress={ this.props.signupProgress }
				/>
			</div>
		);
	}

	renderScreen() {
		return (
			<div>
				{ this.renderChoices() }
				{ this.renderBackLink() }
			</div>
		);
	}

	handleClickChoice = ( designType ) => {
		const {
			stepName,
			goToStep,
			goToNextStep,
		} = this.props;

		const domain = this.getDomainName();
		const tld = domain.split( '.' ).slice( 1 ).join( '.' );
		const domainItem = cartItems.domainRegistration( { productSlug: tlds[ tld ], domain } );

		if ( designType === 'existing-site' ) {
			SignupActions.submitSignupStep( {
				stepName,
				designType,
				domainItem,
				isPurchasingItem: true,
			}, [], { domainItem } );
			goToNextStep();
			return;
		}

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
			SignupActions.submitSignupStep( { stepName: 'site-picker', wasSkipped: true }, [], {} );
			SignupActions.submitSignupStep( { stepName: 'themes', wasSkipped: true }, [], {
				themeSlugWithRepo: 'pub/twentysixteen'
			} );
			SignupActions.submitSignupStep( { stepName: 'plans', wasSkipped: true }, [], { cartItem: null, privacyItem: null } );
			goToStep( 'user' );
		} else {
			SignupActions.submitSignupStep( { stepName: 'site-picker', wasSkipped: true }, [], {} );
			goToStep( 'themes' );
		}
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.headerText }
				subHeaderText={ this.props.subHeaderText }
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
			isLoggedIn: !! getCurrentUserId( state )
		};
	}
)( localize( SiteOrDomain ) );
