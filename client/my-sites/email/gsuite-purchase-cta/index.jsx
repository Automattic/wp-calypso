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
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import config from 'config';
import CompactCard from 'components/card/compact';
import { emailManagementNewGSuiteAccount } from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductCost } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import GSuiteFeatures from 'components/gsuite/gsuite-features';
import GSuiteLearnMore from 'components/gsuite/gsuite-learn-more';
import GSuitePrice from 'components/gsuite/gsuite-price';
import GSuitePurchaseCtaSkuInfo from 'my-sites/email/gsuite-purchase-cta/sku-info';
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
	gsuiteBusinessCost,
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

	const handleLearnMoreClick = () => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_learn_more_click', {
			domain_name: domainName,
		} );
	};

	const translate = useTranslate();
	const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );
	// only allow test for USD users, this is supposed to be a countryCode but nothing prevents
	// arbitrary codes being used. Also wait until we have the currencyCode to check.
	const abTestGroup =
		null !== currencyCode ? abtest( 'gsuitePurchaseCtaOptions', currencyCode ) : 'none';
	const showBusinessOption =
		abTestGroup === 'showBusinessWithAnnualPrices' ||
		abTestGroup === 'showBusinessWithMonthlyPrices';
	const showMonthlyPrice =
		abTestGroup === 'hideBusinessWithMonthlyPrices' ||
		abTestGroup === 'showBusinessWithMonthlyPrices';

	const renderBasicSku = () => (
		<div>
			{ showBusinessOption && (
				<GSuitePurchaseCtaSkuInfo
					skuName={ translate( 'G Suite Basic' ) }
					storageText={ translate( '30 GB of Storage' ) }
				/>
			) }
			<GSuitePrice
				cost={ gsuiteBasicCost }
				currencyCode={ currencyCode }
				showMonthlyPrice={ showMonthlyPrice }
			/>
			{ upgradeAvailable && (
				<Button
					className="gsuite-purchase-cta__get-gsuite-button"
					onClick={ () => {
						goToAddGSuiteUsers( 'basic' );
					} }
					primary
				>
					{ showBusinessOption ? translate( 'Add G Suite Basic' ) : translate( 'Add G Suite' ) }
				</Button>
			) }
		</div>
	);

	const renderBusinessSku = () => (
		<div>
			<GSuitePurchaseCtaSkuInfo
				skuName={ translate( 'G Suite Business' ) }
				storageText={ translate( 'Unlimited Storage' ) }
				storageNoticeText={ translate( 'Accounts with fewer than 5 users have 1 TB per user.' ) }
			/>
			<GSuitePrice
				cost={ gsuiteBusinessCost }
				currencyCode={ currencyCode }
				showMonthlyPrice={ showMonthlyPrice }
			/>
			{ upgradeAvailable && (
				<Button
					className="gsuite-purchase-cta__get-gsuite-button"
					onClick={ () => {
						goToAddGSuiteUsers( 'business' );
					} }
				>
					{ translate( 'Add G Suite Business' ) }
				</Button>
			) }
		</div>
	);

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
			<CompactCard className="gsuite-purchase-cta__header">
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
					{ ! showBusinessOption && renderBasicSku() }
					{ showBusinessOption && (
						<div className="gsuite-purchase-cta__skus">
							{ renderBasicSku() }
							{ renderBusinessSku() }
						</div>
					) }
				</div>

				<div className="gsuite-purchase-cta__header-image">
					<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
				</div>
			</CompactCard>
			<CompactCard className="gsuite-purchase-cta__info">
				<GSuiteFeatures domainName={ domainName } type={ 'grid' } productSlug={ 'gapps' } />
				<GSuiteLearnMore onClick={ handleLearnMoreClick } />
			</CompactCard>
		</EmailVerificationGate>
	);
};

GSuitePurchaseCta.propTypes = {
	currencyCode: PropTypes.string,
	domainName: PropTypes.string.isRequired,
	gsuiteBasicCost: PropTypes.number,
	gsuiteBusinessCost: PropTypes.number,
	recordTracksEvent: PropTypes.func.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

export default connect(
	state => ( {
		gsuiteBasicCost: getProductCost( state, 'gapps' ),
		gsuiteBusinessCost: getProductCost( state, 'gapps_unlimited' ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent }
)( GSuitePurchaseCta );
