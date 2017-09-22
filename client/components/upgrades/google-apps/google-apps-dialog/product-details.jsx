/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class GoogleAppsProductDetails extends Component {
	static propTypes = {
		annualPrice: PropTypes.string.isRequired,
		monthlyPrice: PropTypes.string.isRequired
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="google-apps-dialog__product-details">
				<div className="google-apps-dialog__product-intro">
					<h3 className="google-apps-dialog__product-name">
						{ /* Intentionally not translable as it is a brand name and Google keeps it in English */ }
						<span className="google-apps-dialog__product-logo">G Suite</span>
					</h3>

					<p>
						{
							translate(
								"We've partnered with Google to offer you email, storage, docs, calendars " +
								'and more, integrated with your site.'
							)
						}
					</p>

					<h4 className="google-apps-dialog__price-per-user">
						{ translate( '%(monthlyPrice)s per user / month', { args: { monthlyPrice: this.props.monthlyPrice } } ) }
					</h4>

					<h5 className="google-apps-dialog__billing-period">
						{ translate( '%(annualPrice)s Billed yearly — get 2 months free!', {
							args: { annualPrice: this.props.annualPrice }
						} ) }
					</h5>
				</div>

				<div className="google-apps-dialog__product-features">
					<h5 className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
						<p>{ translate( 'Professional email address' ) }</p>
					</h5>

					<h5 className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_drive_48dp.svg" />
						<p>{ translate( '30GB Online File Storage' ) }</p>
					</h5>

					<h5 className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_docs_48dp.svg" />
						<p>{ translate( 'Docs, spreadsheets, and more' ) }</p>
					</h5>

					<h5 className="google-apps-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_hangouts_48dp.svg" />
						<p>{ translate( 'Video and voice calls' ) }</p>
					</h5>
				</div>
			</div>
		);
	}
}

export default localize( GoogleAppsProductDetails );
