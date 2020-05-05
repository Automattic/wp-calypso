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
import config from 'config';
import { emailManagementNewGSuiteAccount } from 'my-sites/email/paths';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductBySlug } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { GSUITE_BASIC_SLUG } from 'lib/gsuite/constants';
import GSuiteFeatures from 'components/gsuite/gsuite-features';
import GSuiteLearnMore from 'components/gsuite/gsuite-learn-more';
import GSuitePrice from 'components/gsuite/gsuite-price';
import { recordTracksEvent } from 'state/analytics/actions';
import QueryProductsList from 'components/data/query-products-list';

/**
 * Style dependencies
 */
import './style.scss';

export const GSuitePurchaseCta = ( {
	currencyCode,
	domainName,
	product,
	recordTracksEvent: recordEvent,
	selectedSiteSlug,
} ) => {
	useEffect( () => {
		recordEvent( 'calypso_email_gsuite_purchase_cta_view', {
			domain_name: domainName,
		} );
	}, [ domainName ] );

	const goToAddGSuiteUsers = ( planType ) => {
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
		currencyCode: getCurrentUserCurrencyCode( state ),
		product: getProductBySlug( state, GSUITE_BASIC_SLUG ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{ recordTracksEvent }
)( GSuitePurchaseCta );
