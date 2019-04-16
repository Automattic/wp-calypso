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
import { getAnnualPrice, getMonthlyPrice } from 'lib/gsuite';

function GoogleAppsProductDetails( { currencyCode, cost, domain, plan } ) {
	const translate = useTranslate();
	const annualPrice = getAnnualPrice( cost, currencyCode );
	const monthlyPrice = getMonthlyPrice( cost, currencyCode );
	// currencyCode can safely replace the countryCode, just make sure we have one first
	const showMonthlyPrice =
		null !== currencyCode
			? 'showMonthlyPrice' === abtest( 'gsuiteDomainFlowOptions', currencyCode )
			: false;

	const getStorageText = () => {
		if ( 'gapps' === plan ) {
			return translate( '30GB Online File Storage' );
		} else if ( 'gapps_unlimited' === plan ) {
			return translate( 'Unlimited cloud storage (or 1TB per user if fewer than 5 users)' );
		}
	};

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

			<ul className="gsuite-dialog__product-features">
				<li className="gsuite-dialog__product-feature">
					<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" alt="" />
					<p>
						{ translate( 'Professional email {{nowrap}}(@%(domain)s){{/nowrap}}', {
							args: { domain: domain },
							components: { nowrap: <span className="gsuite-dialog__domain" /> },
						} ) }
					</p>
				</li>

				<li className="gsuite-dialog__product-feature">
					<img src="/calypso/images/g-suite/logo_drive_48dp.svg" alt="" />
					<p>{ getStorageText() }</p>
				</li>

				<li className="gsuite-dialog__product-feature">
					<img src="/calypso/images/g-suite/logo_docs_48dp.svg" alt="" />
					<p>{ translate( 'Docs, spreadsheets, and more' ) }</p>
				</li>

				<li className="gsuite-dialog__product-feature">
					<img src="/calypso/images/g-suite/logo_hangouts_48px.png" alt="" />
					<p>{ translate( 'Video and voice calls' ) }</p>
				</li>
			</ul>
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
