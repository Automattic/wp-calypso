/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { domainRegistration } from 'lib/cart-values/cart-items';
import StepWrapper from 'signup/step-wrapper';
import { submitSignupStep } from 'state/signup/progress/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getDomainProductSlug } from 'lib/domains';
import SiteOrDomainChoice from './choice';
import DomainImage from './domain-image';
import NewSiteImage from './new-site-image';
import ExistingSiteImage from './existing-site-image';

/**
 * Style dependencies
 */
import './style.scss';

class SiteOrDomain extends Component {
	getDomainName() {
		const { signupDependencies } = this.props;
		let isValidDomain = false;
		const domain = get( signupDependencies, 'domainItem.meta', false );

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
					'Choose a theme, customize, and launch your site. A free domain for one year is included with all plans.'
				),
			},
		];

		if ( this.props.isLoggedIn ) {
			choices.push( {
				type: 'existing-site',
				label: translate( 'Existing WordPress.com site' ),
				image: <ExistingSiteImage />,
				description: translate(
					'Use with a site you already started. A free domain for one year is included with all plans.'
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

	renderScreen() {
		return (
			<div>
				{ ! this.props.productsLoaded && <QueryProductsList /> }
				{ this.renderChoices() }
			</div>
		);
	}

	submitDomain( designType ) {
		const { stepName } = this.props;

		const domain = this.getDomainName();
		const productSlug = getDomainProductSlug( domain );
		const domainItem = domainRegistration( { productSlug, domain } );
		const siteUrl = domain;

		this.props.submitSignupStep(
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
	}

	submitDomainOnlyChoice() {
		const { goToStep } = this.props;

		// we can skip the next two steps in the `domain-first` flow if the
		// user is only purchasing a domain
		this.props.submitSignupStep( { stepName: 'site-picker', wasSkipped: true } );
		this.props.submitSignupStep(
			{ stepName: 'themes', wasSkipped: true },
			{ themeSlugWithRepo: 'pub/twentysixteen' }
		);
		this.props.submitSignupStep(
			{ stepName: 'plans-site-selected', wasSkipped: true },
			{ cartItem: null }
		);
		goToStep( 'user' );
	}

	handleClickChoice = ( designType ) => {
		const { goToStep, goToNextStep } = this.props;

		this.submitDomain( designType );

		if ( designType === 'domain' ) {
			this.submitDomainOnlyChoice();
		} else if ( designType === 'existing-site' ) {
			goToNextStep();
		} else {
			this.props.submitSignupStep( { stepName: 'site-picker', wasSkipped: true } );
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
					fallbackHeaderText={ headerText }
					fallbackSubHeaderText={ subHeaderText }
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
				stepContent={ this.renderScreen() }
			/>
		);
	}
}

export default connect(
	( state ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );

		return {
			isLoggedIn: !! getCurrentUserId( state ),
			productsList,
			productsLoaded,
		};
	},
	{ submitSignupStep }
)( localize( SiteOrDomain ) );
