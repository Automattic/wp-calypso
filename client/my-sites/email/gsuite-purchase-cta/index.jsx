/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import config from 'config';
import { emailManagementAddGSuiteUsers } from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getAnnualPrice } from 'lib/google-apps';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getEligibleGSuiteDomain } from 'lib/domains/gsuite';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';
import GSuitePurchaseCtaSkuInfo from './sku-info';
import QueryProductsList from 'components/data/query-products-list';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseCta extends React.Component {
	goToAddGSuiteUsers = planType => {
		page(
			emailManagementAddGSuiteUsers( this.props.selectedSiteSlug, planType, this.props.domainName )
		);
	};

	renderCta() {
		const { currencyCode, domainName, productsList, translate } = this.props;
		const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );

		const basicAnnualPrice = getAnnualPrice(
			get( productsList.gapps, [ 'prices', currencyCode ], 0 ),
			currencyCode
		);
		const businessAnnualPrice = getAnnualPrice(
			get( productsList.gapps_unlimited, [ 'prices', currencyCode ], 0 ),
			currencyCode
		);

		return (
			<Fragment>
				<QueryProductsList />
				<CompactCard>
					<header>
						<h3 className="gsuite-purchase-cta__product-logo">
							{ /* Intentionally not translated */ }
							<strong>G Suite</strong>
						</h3>
					</header>
				</CompactCard>
				<CompactCard>
					<div className="gsuite-purchase-cta__header">
						<div className="gsuite-purchase-cta__header-description">
							<h2 className="gsuite-purchase-cta__header-description-title">
								{ translate( 'Professional email and so much more.' ) }
							</h2>

							<p className="gsuite-purchase-cta__description-sub-title">
								{ translate(
									"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
								) }
							</p>

							<div className="gsuite-purchase-cta__skus">
								<GSuitePurchaseCtaSkuInfo
									annualPrice={ basicAnnualPrice }
									buttonText={ translate( 'Add G Suite' ) }
									nButtonClick={ () => this.goToAddGSuiteUsers( 'basic' ) }
									showButton={ upgradeAvailable }
									skuName={ translate( 'G Suite' ) }
									skuSubText={ translate( '30GB of Storage' ) }
								/>
								<GSuitePurchaseCtaSkuInfo
									annualPrice={ businessAnnualPrice }
									buttonText={ translate( 'Add G Suite Business' ) }
									onButtonClick={ () => this.goToAddGSuiteUsers( 'business' ) }
									showButton={ upgradeAvailable }
									skuName={ translate( 'G Suite Business' ) }
									skuSubText={ translate( 'Unlimited Storage' ) }
								/>
							</div>
						</div>

						<div className="gsuite-purchase-cta__header-image">
							<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<GSuitePurchaseFeatures domainName={ domainName } type={ 'grid' } />
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
	domainName: PropTypes.string.isRequired,
	productsList: PropTypes.object,
	selectedDomainName: PropTypes.string,
	selectedSiteSlug: PropTypes.string.isRequired,
};

export default connect(
	( state, { selectedDomainName } ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const domains = getDomainsBySiteId( state, selectedSiteId );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			domainName: getEligibleGSuiteDomain( selectedDomainName, domains ),
			productsList: getProductsList( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	null
)( localize( GSuitePurchaseCta ) );
