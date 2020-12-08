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
import { Button, CompactCard } from '@automattic/components';
import config from 'calypso/config';
import { emailManagementNewGSuiteAccount } from 'calypso/my-sites/email/paths';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GSUITE_BASIC_SLUG } from 'calypso/lib/gsuite/constants';
import GSuiteFeatures from 'calypso/components/gsuite/gsuite-features';
import GSuiteLearnMore from 'calypso/components/gsuite/gsuite-learn-more';
import GSuitePrice from 'calypso/components/gsuite/gsuite-price';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import QueryProductsList from 'calypso/components/data/query-products-list';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

/**
 * Style dependencies
 */
import './style.scss';

export const GSuitePurchaseCta = ( {
	currencyCode,
	currentRoute,
	domainName,
	product,
	recordTracksEvent: recordEvent,
	selectedSiteSlug,
} ) => {
	useEffect( () => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_view', {
			domain_name: domainName,
		} );
	}, [ domainName ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const goToAddGSuiteUsers = ( planType ) => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_get_gsuite_click', {
			domain_name: domainName,
			plan_type: planType,
		} );

		page( emailManagementNewGSuiteAccount( selectedSiteSlug, domainName, planType, currentRoute ) );
	};

	const handleLearnMoreClick = () => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_learn_more_click', {
			domain_name: domainName,
		} );
	};

	const translate = useTranslate();
	const upgradeAvailable = config.isEnabled( 'upgrades/checkout' );

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

					<div>
						<GSuitePrice product={ product } currencyCode={ currencyCode } />

						{ upgradeAvailable && (
							<Button
								className="gsuite-purchase-cta__get-gsuite-button"
								onClick={ () => {
									goToAddGSuiteUsers( 'basic' );
								} }
								primary
							>
								{ translate( 'Add G Suite' ) }
							</Button>
						) }
					</div>
				</div>

				<div className="gsuite-purchase-cta__header-image">
					<img alt="G Suite Logo" src="/calypso/images/g-suite/g-suite.svg" />
				</div>
			</CompactCard>

			<CompactCard className="gsuite-purchase-cta__info">
				<GSuiteFeatures domainName={ domainName } productSlug={ GSUITE_BASIC_SLUG } />

				<GSuiteLearnMore onLearnMoreClick={ handleLearnMoreClick } />
			</CompactCard>
		</EmailVerificationGate>
	);
};

GSuitePurchaseCta.propTypes = {
	currencyCode: PropTypes.string,
	domainName: PropTypes.string.isRequired,
	product: PropTypes.object,
	recordTracksEvent: PropTypes.func.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

export default connect(
	( state ) => ( {
		currentRoute: getCurrentRoute( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		product: getProductBySlug( state, GSUITE_BASIC_SLUG ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent }
)( GSuitePurchaseCta );
