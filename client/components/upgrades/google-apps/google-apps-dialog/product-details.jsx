/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Badge from 'components/badge';

class GoogleAppsProductDetails extends Component {
	static propTypes = {
		annualPrice: PropTypes.string.isRequired,
		monthlyPrice: PropTypes.string.isRequired,
		showDiscount: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		showDiscount: false,
	};

	renderPrice() {
		const { translate } = this.props;

		if ( this.props.showDiscount ) {
			return (
				<Fragment>
					<del>
						{ translate( '%(monthlyPrice)s per user / month', {
							args: { monthlyPrice: this.props.monthlyPrice },
						} ) }
					</del>
					<strong>
						{ /* Do not translate this string as it is a part of an abtest. */ }
						{ this.props.discountMonthlyPrice } per user / month
					</strong>
				</Fragment>
			);
		}

		return translate( '%(monthlyPrice)s per user / month', {
			args: { monthlyPrice: this.props.monthlyPrice },
		} );
	}

	// Do not translate this function as it is a part of an abtest.
	renderPromotionalCopy() {
		if ( ! this.props.showDiscount ) {
			return null;
		}

		return (
			<div className="google-apps-dialog__promotional-copy">
				LIMITED-TIME ONLY: { this.props.discountAnnualPrice } FOR THE FIRST YEAR
				<Badge type="succes">{ this.props.discountRate }% OFF</Badge>
			</div>
		);
	}

	renderPeriod() {
		if ( this.props.showDiscount ) {
			// Do not translate this string as it is a part of an abtest.
			return `${ this.props.annualPrice } Billed yearly`;
		}

		return this.props.translate( '%(annualPrice)s Billed yearly — get 2 months free!', {
			args: { annualPrice: this.props.annualPrice },
		} );
	}

	render() {
		const { translate, showDiscount } = this.props;

		return (
			<div
				className={ classnames( 'google-apps-dialog__product-details', {
					'with-discount': showDiscount,
				} ) }
			>
				<div className="google-apps-dialog__product-intro">
					<div className="google-apps-dialog__product-name">
						{ /* Intentionally not translable as it is a brand name and Google keeps it in English */ }
						<span className="google-apps-dialog__product-logo">G Suite</span>
					</div>

					<p>
						{ translate(
							"We've teamed up with Google to offer you email, storage, docs, calendars, " +
								'and more, integrated with your site.'
						) }
					</p>

					<div className="google-apps-dialog__price-per-user">{ this.renderPrice() }</div>

					<div className="google-apps-dialog__billing-period">{ this.renderPeriod() }</div>

					{ this.renderPromotionalCopy() }
				</div>

				<ul className="google-apps-dialog__product-features">
					<li className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
						<p>
							{ translate( 'Professional email {{nowrap}}(@%(domain)s){{/nowrap}}', {
								args: { domain: this.props.domain },
								components: { nowrap: <span className="google-apps-dialog__domain" /> },
							} ) }
						</p>
					</li>

					<li className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_drive_48dp.svg" />
						<p>{ translate( '30GB Online File Storage' ) }</p>
					</li>

					<li className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_docs_48dp.svg" />
						<p>{ translate( 'Docs, spreadsheets, and more' ) }</p>
					</li>

					<li className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_hangouts_48px.png" />
						<p>{ translate( 'Video and voice calls' ) }</p>
					</li>
				</ul>
			</div>
		);
	}
}

export default localize( GoogleAppsProductDetails );
