/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteBySlug } from 'state/sites/selectors';
import StepWrapper from 'signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSecureYourBrand } from 'state/secure-your-brand/selectors';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import { Button, Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import QuerySecureYourBrand from 'components/data/query-secure-your-brand';
import { domainRegistration } from 'lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './style.scss';

export class SecureYourBrandStep extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	getDomainName() {
		return this.props.domainItem && this.props.domainItem.meta;
	}

	handleUpgradeButtonClick() {
		const { additionalStepData, stepSectionName, stepName, domains } = this.props;

		this.props.recordTracksEvent( 'calypso_secure_your_brand_add' );
		const cartItems = domains?.map( ( domain ) =>
			domainRegistration( { productSlug: domain.product_slug, domain: domain.domain } )
		);
		const step = {
			stepName,
			stepSectionName,
			cartItems,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, { cartItems } );
		this.props.goToNextStep();
	}

	handleSkipButtonClick() {
		const { additionalStepData, stepSectionName, stepName } = this.props;

		this.props.recordTracksEvent( 'calypso_secure_your_brand_skip' );
		const step = {
			stepName,
			stepSectionName,
			cartItems: null,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, { cartItems: null } );
		this.props.goToNextStep();
	}

	recommendedDomains() {
		const { translate, secureYourBrand } = this.props;
		const domain = this.getDomainName();
		this.getDomainName();
		const productData = secureYourBrand.product_data;
		const currency = secureYourBrand.currency;
		const discountedCost = formatCurrency( secureYourBrand.discounted_cost, currency, {
			stripZeros: true,
		} );
		const totalCost = formatCurrency( secureYourBrand.total_cost, currency, { stripZeros: true } );
		const classNames = {
			'is-primary': true,
		};

		return (
			<div className="secure-your-brand">
				<QuerySecureYourBrand domain={ domain } />
				<Card>
					<div className="secure-your-brand__available">
						{ translate( '%(domain)s is available', { args: { domain } } ) }
					</div>
					<h3>{ translate( 'Domain signup bundle' ) }</h3>
					<div className="secure-your-brand__domains">
						{ productData?.map( ( suggestion ) => (
							<div className="secure-your-brand__domain" key={ suggestion.domain }>
								<div>{ suggestion.domain }</div>
								<div className="secure-your-brand__cost">
									{ formatCurrency( suggestion.cost, currency, { stripZeros: true } ) }
								</div>
							</div>
						) ) }
					</div>
					<div>
						<div>{ translate( 'Total' ) }</div>
						<div>
							{ translate( '%(discountedCost)s for your first year', {
								args: { discountedCost },
							} ) }
						</div>
						<div>{ totalCost }</div>
					</div>
					<div>
						<Button onClick={ () => this.handleSkipButtonClick() }>
							{ translate( 'No thanks, continue' ) }
						</Button>
						<Button className={ classNames } onClick={ () => this.handleUpgradeButtonClick() }>
							{ translate( 'Yes, add them to my cart' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	render() {
		const { flowName, stepName, positionInFlow, translate } = this.props;

		const subHeaderText = translate(
			'Secure your name and save 50% with our Domain signup bundle'
		);
		const headerText = translate( 'Secure your name' );

		return (
			<div className="secure-your-brand__step-secton-wrapper">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					isWideLayout={ true }
					stepContent={ this.recommendedDomains() }
				/>
			</div>
		);
	}
}

SecureYourBrandStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	flowName: PropTypes.string,
};

export default connect(
	( state, { signupDependencies: { siteSlug, domainItem } } ) => ( {
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
		domainItem,
		secureYourBrand: getSecureYourBrand( state ),
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep }
)( localize( SecureYourBrandStep ) );
