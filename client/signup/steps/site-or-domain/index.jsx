/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import SiteOrDomainChoice from './choice';
import { getCurrentUserId } from 'state/current-user/selectors';
// TODO: `design-type-with-store`, `design-type`, and this component could be refactored to reduce redundancy
import DomainImage from 'signup/steps/design-type-with-store/domain-image';
import NewSiteImage from 'signup/steps/design-type-with-store/new-site-image';
import ExistingSite from 'signup/steps/design-type-with-store/existing-site';
import NavigationLink from 'signup/navigation-link';
import QueryProductsList from 'components/data/query-products-list';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getDomainProductSlug } from 'lib/domains';

class SiteOrDomain extends Component {
	getDomainName() {
		const { initialContext: { query }, step } = this.props;
		let domain,
			isValidDomain = false;

		if ( query && query.new ) {
			domain = query.new;
		} else if ( step && step.domainItem ) {
			domain = step.domainItem.meta;
		}

		if ( domain ) {
			if ( domain.split( '.' ).length > 1 ) {
				const productSlug = getDomainProductSlug( domain );

				isValidDomain = !! this.props.productsList[ productSlug ];
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
				description: translate(
					'Choose a theme, customize, and launch your site. Free domain included with all plans.'
				),
			},
		];

		if ( this.props.isLoggedIn ) {
			choices.push( {
				type: 'existing-site',
				label: translate( 'Existing WordPress.com site' ),
				image: <ExistingSite />,
				description: translate(
					'Use with a site you already started. Free domain included with all plans.'
				),
			} );
		}

		choices.push( {
			type: 'domain',
			label: translate( 'Just buy a domain' ),
			image: <DomainImage />,
			description: translate( 'Show a "coming soon" notice on your domain. Add a site later.' ),
		} );

		return choices;
	}

	renderChoices() {
		return (
			<div className="site-or-domain__choices">
				{ this.getChoices().map( ( choice, index ) => (
					<SiteOrDomainChoice
						choice={ choice }
						handleClickChoice={ this.handleClickChoice }
						isPlaceholder={ ! this.props.productsLoaded }
						key={ `site-or-domain-choice-${ index }` }
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
				{ ! this.props.productsLoaded && <QueryProductsList /> }
				{ this.renderChoices() }
				{ this.renderBackLink() }
			</div>
		);
	}

	handleClickChoice = designType => {
		const { stepName, goToStep, goToNextStep } = this.props;

		const domain = this.getDomainName();
		const productSlug = getDomainProductSlug( domain );
		const domainItem = cartItems.domainRegistration( { productSlug, domain } );
		const siteUrl = domain;

		SignupActions.submitSignupStep(
			{
				stepName,
				domainItem,
				designType,
				siteSlug: domain,
				siteUrl,
				isPurchasingItem: true,
			},
			{ designType, domainItem, siteUrl }
		);

		if ( designType === 'domain' ) {
			// we can skip the next two steps in the `domain-first` flow if the
			// user is only purchasing a domain
			SignupActions.submitSignupStep( { stepName: 'site-picker', wasSkipped: true }, {} );
			SignupActions.submitSignupStep(
				{ stepName: 'themes', wasSkipped: true },
				{
					themeSlugWithRepo: 'pub/twentysixteen',
				}
			);
			SignupActions.submitSignupStep(
				{ stepName: 'plans-site-selected', wasSkipped: true },
				{
					cartItem: null,
					privacyItem: null,
				}
			);
			goToStep( 'user' );
		} else if ( designType === 'existing-site' ) {
			goToNextStep();
		} else {
			SignupActions.submitSignupStep( { stepName: 'site-picker', wasSkipped: true }, {} );
			goToStep( 'themes' );
		}
	};

	render() {
		const { translate, productsLoaded } = this.props;

		if ( productsLoaded && ! this.getDomainName() ) {
			const headerText = translate( 'Unsupported domain.' );
			const subHeaderText = translate(
				'Please visit {{a}}wordpress.com/domains{{/a}} to search for a domain.',
				{
					components: {
						a: <a href={ 'https://wordpress.com/domains' } />,
					},
				}
			);

			return (
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
				/>
			);
		}

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
				stepContent={ this.renderScreen() }
			/>
		);
	}
}

export default connect( state => {
	const productsList = getAvailableProductsList( state );
	const productsLoaded = ! isEmpty( productsList );

	return {
		isLoggedIn: !! getCurrentUserId( state ),
		productsList,
		productsLoaded,
	};
} )( localize( SiteOrDomain ) );
