/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import CompactCard from 'components/card/compact';
import { emailManagementNewGSuiteAccount } from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getAnnualPrice } from 'lib/google-apps';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductCost } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import GSuitePurchaseCtaSkuInfo from 'my-sites/email/gsuite-purchase-cta/sku-info';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';
import { recordTracksEvent } from 'state/analytics/actions';
import QueryProductsList from 'components/data/query-products-list';

/**
 * Style dependencies
 */
import './style.scss';

export const GSuitePurchaseCta = ( {
	currencyCode,
	domainName,
	gsuiteBasicCost,
	recordTracksEvent: recordEvent,
	selectedSiteSlug,
} ) => {
	useEffect(() => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_view', {
			domain_name: domainName,
		} );
	}, [ domainName ]);

	const goToAddGSuiteUsers = planType => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_get_gsuite_click', {
			domain_name: domainName,
			plan_type: planType,
		} );

		page( emailManagementNewGSuiteAccount( selectedSiteSlug, domainName, planType ) );
	};

	const translate = useTranslate();
	const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );
	// display '-' instead of 0 if we don't have a price yet
	const gsuiteBasicAnnualCost =
		gsuiteBasicCost && currencyCode ? getAnnualPrice( gsuiteBasicCost, currencyCode ) : '-';

	return (
		<EmailVerificationGate
			noticeText={ translate( 'You must verify your email to purchase G Suite.' ) }
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
								annualPrice={ gsuiteBasicAnnualCost }
								buttonText={ translate( 'Add G Suite' ) }
								onButtonClick={ () => {
									goToAddGSuiteUsers( 'basic' );
								} }
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
				<GSuitePurchaseFeatures domainName={ domainName } type={ 'grid' } productSlug={ 'gapps' } />
			</CompactCard>
		</EmailVerificationGate>
	);
};

GSuitePurchaseCta.propTypes = {
	currencyCode: PropTypes.string,
	domainName: PropTypes.string.isRequired,
	gsuiteBasicCost: PropTypes.number,
	recordTracksEvent: PropTypes.func.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

export default connect(
	state => ( {
		gsuiteBasicCost: getProductCost( state, 'gapps' ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent }
)( GSuitePurchaseCta );
