/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import CompactCard from 'components/card/compact';
import config from 'config';
import { domainManagementAddGSuiteUsers } from 'my-sites/domains/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getEligibleGSuiteDomain } from 'lib/domains/gsuite';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseCta extends React.Component {
	goToAddGoogleApps = () => {
		page( domainManagementAddGSuiteUsers( this.props.selectedSite.slug, this.props.domainName ) );
	};

	getPlanText() {
		const { productSlug, translate } = this.props;
		if ( 'gapps_unlimited' === productSlug ) {
			return translate( 'Business' );
		}
	}

	renderCta() {
		const { annualPrice, domainName, monthlyPrice, productSlug, translate } = this.props;
		const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );

		return (
			<Fragment>
				<CompactCard>
					<header className="gsuite-purchase-cta__add-google-apps-card-header">
						<h3 className="gsuite-purchase-cta__add-google-apps-card-product-logo">
							{ /* Intentionally not translated */ }
							<strong>G Suite</strong>
							{ this.getPlanText() }
						</h3>
					</header>
				</CompactCard>

				<CompactCard>
					<div className="gsuite-purchase-cta__add-google-apps-card-product-details">
						<div className="gsuite-purchase-cta__add-google-apps-card-description">
							<h2 className="gsuite-purchase-cta__add-google-apps-card-title">
								{ translate( 'Professional email and so much more.' ) }
							</h2>

							<p className="gsuite-purchase-cta__add-google-apps-card-sub-title">
								{ translate(
									"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
								) }
							</p>

							<div className="gsuite-purchase-cta__add-google-apps-card-price">
								<h4 className="gsuite-purchase-cta__add-google-apps-card-price-per-user">
									<span>
										{ translate( '{{strong}}%(price)s{{/strong}} per user / month', {
											components: {
												strong: <strong />,
											},
											args: {
												price: monthlyPrice,
											},
										} ) }
									</span>
								</h4>

								{ upgradeAvailable && (
									<Button type="button" onClick={ this.goToAddGoogleApps }>
										{ translate( 'Add G Suite' ) }
									</Button>
								) }

								<h5 className="gsuite-purchase-cta__add-google-apps-card-billing-period">
									{ translate( '%(price)s billed yearly (2 months free!)', {
										args: {
											price: annualPrice,
										},
									} ) }
								</h5>
							</div>
						</div>

						<div className="gsuite-purchase-cta__add-google-apps-card-logos">
							<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
						</div>
					</div>
				</CompactCard>

				<CompactCard>
					<GSuitePurchaseFeatures
						domainName={ domainName }
						productSlug={ productSlug }
						type={ 'grid' }
					/>

					<div className="gsuite-purchase-cta__add-google-apps-card-secondary-button">
						{ upgradeAvailable && (
							<Button type="button" onClick={ this.goToAddGoogleApps }>
								{ translate( 'Add G Suite' ) }
							</Button>
						) }
					</div>
				</CompactCard>
			</Fragment>
		);
	}

	render() {
		return (
			<EmailVerificationGate
				noticeText={ this.props.translate( 'You must verify your email to purchase G Suite.' ) }
				noticeStatus="is-info"
			>
				{ this.renderCta() }
			</EmailVerificationGate>
		);
	}
}

GSuitePurchaseCta.propTypes = {
	annualPrice: PropTypes.string.isRequired,
	domainName: PropTypes.string.isRequired,
	monthlyPrice: PropTypes.string.isRequired,
	productSlug: PropTypes.string.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
};

export default connect(
	( state, { selectedDomainName, selectedSite } ) => {
		const domains = getDomainsBySiteId( state, selectedSite.ID );
		return {
			domainName: getEligibleGSuiteDomain( selectedDomainName, domains ),
		};
	},
	null
)( localize( GSuitePurchaseCta ) );
