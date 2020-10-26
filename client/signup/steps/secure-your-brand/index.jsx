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
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSecureYourBrand } from 'calypso/state/secure-your-brand/selectors';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { Button, Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import QuerySecureYourBrand from 'calypso/components/data/query-secure-your-brand';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import Gridicon from 'calypso/components/gridicon';
import CardHeading from 'calypso/components/card-heading';

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
		const { additionalStepData, stepSectionName, stepName, secureYourBrand } = this.props;

		this.props.recordTracksEvent( 'calypso_secure_your_brand_add' );
		const domainUpsellItems = secureYourBrand?.product_data?.map( ( domain ) =>
			domainRegistration( { productSlug: domain.product_slug, domain: domain.domain } )
		);
		const step = {
			stepName,
			stepSectionName,
			domainUpsellItems,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, { domainUpsellItems } );
		this.props.goToNextStep();
	}

	handleSkipButtonClick() {
		const { additionalStepData, stepSectionName, stepName } = this.props;

		this.props.recordTracksEvent( 'calypso_secure_your_brand_skip' );
		const step = {
			stepName,
			stepSectionName,
			domainUpsellItems: null,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, { domainUpsellItems: null } );
		this.props.goToNextStep();
	}

	getFormattedDomain( domain ) {
		const domainBase = domain.substring( 0, domain.indexOf( '.' ) );
		const domainTld = domain.substring( domain.indexOf( '.' ) );
		return (
			<>
				{ domainBase }
				<span>{ domainTld }</span>
			</>
		);
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
						<Gridicon icon="checkmark-circle" />
						<span>{ translate( '%(domain)s is available', { args: { domain } } ) }</span>
					</div>
					<CardHeading size={ 20 } tagName="h3">
						{ translate( 'Domain signup bundle' ) }
					</CardHeading>
					<div className="secure-your-brand__domains">
						{ productData?.map( ( suggestion ) => (
							<div className="secure-your-brand__domain" key={ suggestion.domain }>
								<div className="secure-your-brand__domain-name">
									{ this.getFormattedDomain( suggestion.domain ) }
								</div>
								<div className="secure-your-brand__cost">
									{ translate( '%(price)s/year', {
										args: {
											price: formatCurrency( suggestion.cost, currency, { stripZeros: true } ),
										},
									} ) }
								</div>
							</div>
						) ) }
					</div>
					<div className="secure-your-brand__total">
						<div className="secure-your-brand__total-label">{ translate( 'Total' ) }</div>
						<div className="secure-your-brand__total-description">
							<span className="secure-your-brand__discount-label">
								{ translate( '%(discountedCost)s for your first year', {
									args: { discountedCost },
								} ) }
							</span>
							<span className="secure-your-brand__total-cost">
								{ translate( '%(totalCost)s/year', {
									args: { totalCost },
								} ) }
							</span>
						</div>
					</div>
					<CardHeading size={ 16 } tagName="h4">
						{ translate(
							'For just {{del}}%(totalCost)s{{/del}} %(discountedCost)s for the first year, you will:',
							{
								args: {
									discountedCost,
									totalCost,
								},
								components: {
									del: <del />,
								},
							}
						) }
					</CardHeading>
					<div className="secure-your-brand__benefits">
						<ul>
							<li>{ translate( 'Prevent anyone from registering (and misusing) your name' ) }</li>
							<li>{ translate( 'Avoid confusing your visitors' ) }</li>
							<li>{ translate( 'Redirect all domains to your site as a catch-all' ) }</li>
							<li>{ translate( 'Unlock SEO and geo-location opportunities' ) }</li>
						</ul>
					</div>
					<div className="secure-your-brand__buttons">
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
