/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import GSuiteCompactFeatures from 'my-sites/email/gsuite-features/compact';

function GoogleAppsProductDetails( { currencyCode, cost, domain, plan } ) {
	const translate = useTranslate();
	const annualPrice = getAnnualPrice( cost, currencyCode );
	const monthlyPrice = getMonthlyPrice( cost, currencyCode );
	// currencyCode can safely replace the countryCode, just make sure we have one first
	const showMonthlyPrice =
		null !== currencyCode
			? 'showMonthlyPrice' === abtest( 'gsuiteDomainFlowOptions', currencyCode )
			: false;

	const renderAnnualPrice = () => {
		return (
			<div className="gsuite-dialog__price-per-user">
				{ translate( '%(annualPrice)s per user / year', {
					args: { annualPrice },
				} ) }
			</div>
		);
	};

	const renderMonthlyPrice = () => {
		return (
			<Fragment>
				<div className="gsuite-dialog__price-per-user">
					{ translate( '%(monthlyPrice)s per user / month', {
						args: { monthlyPrice },
					} ) }
				</div>

				<div className="gsuite-dialog__billing-period">
					{ translate( '%(annualPrice)s billed yearly', {
						args: { annualPrice },
					} ) }
				</div>
			</Fragment>
		);
	};

	return (
		<div className="gsuite-dialog__product-details">
			<div className="gsuite-dialog__product-intro">
				<div className="gsuite-dialog__product-name">
					{ /* Intentionally not translated as it is a brand name and Google keeps it in English */ }
					<span className="gsuite-dialog__product-logo">G Suite</span>
				</div>

				<p>
					{ translate(
						"We've teamed up with Google to offer you email, storage, docs, calendars, " +
							'and more, integrated with your site.'
					) }
				</p>

				{ showMonthlyPrice ? renderMonthlyPrice() : renderAnnualPrice() }
			</div>

			<GSuiteCompactFeatures domainName={ domain } productSlug={ plan } type={ 'list' } />
		</div>
	);
}

GoogleAppsProductDetails.propTypes = {
	currencyCode: PropTypes.string,
	cost: PropTypes.number,
	domain: PropTypes.string.isRequired,
	plan: PropTypes.string.isRequired,
};

export default GoogleAppsProductDetails;
