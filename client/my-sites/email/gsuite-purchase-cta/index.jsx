/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
import { recordTracksEvent } from 'state/analytics/actions';
import QueryProductsList from 'components/data/query-products-list';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseCta extends Component {
	goToAddGSuiteUsers = () => {
		this.props.recordTracksEvent( 'calypso_email_gsuite_purchase_cta_get_gsuite_click', {
			domain: this.props.domainName,
		} );

		page( emailManagementAddGSuiteUsers( this.props.selectedSiteSlug, this.props.domainName ) );
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_email_gsuite_purchase_cta_view', {
			domain: this.props.domainName,
		} );
	}

	render() {
		const { currencyCode, domainName, productsList, translate } = this.props;
		const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );

		const annualPrice = get( productsList, [ 'gapps', 'prices', currencyCode ], null );
		const annualPriceFormatted =
			null === annualPrice ? '-' : getAnnualPrice( annualPrice, currencyCode );

		return (
			<EmailVerificationGate
				noticeText={ this.props.translate( 'You must verify your email to purchase G Suite.' ) }
				noticeStatus="is-info"
			>
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

							<p className="gsuite-purchase-cta__header-description-sub-title">
								{ translate(
									"We've partnered with Google to offer you email, " +
										'storage, docs, calendars, and more integrated with your site.'
								) }
							</p>

							<div className="gsuite-purchase-cta__skus">
								<GSuitePurchaseCtaSkuInfo
									annualPrice={ annualPriceFormatted }
									buttonText={ translate( 'Add G Suite' ) }
									onButtonClick={ this.goToAddGSuiteUsers }
									showButton={ upgradeAvailable }
								/>
							</div>
						</div>

						<div className="gsuite-purchase-cta__header-image">
							<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
						</div>
					</div>
				</CompactCard>
				<CompactCard>
					<GSuitePurchaseFeatures
						domainName={ domainName }
						type={ 'grid' }
						productSlug={ 'gapps' }
					/>
				</CompactCard>
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
	{ recordTracksEvent }
)( localize( GSuitePurchaseCta ) );
