/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

class GoogleAppsProductDetails extends Component {
	static propTypes = {
		annualPrice: PropTypes.string.isRequired,
	};

	getStorageText() {
		const { plan, translate } = this.props;
		if ( 'gapps' === plan ) {
			return translate( '30GB Online File Storage' );
		} else if ( 'gapps_unlimited' === plan ) {
			return translate( 'Unlimited cloud storage (or 1TB per user if fewer than 5 users)' );
		}
	}

	renderPrice() {
		return this.props.translate( '%(annualPrice)s per user / year', {
			args: { annualPrice: this.props.annualPrice },
		} );
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="gsuite-dialog__product-details">
				<div className="gsuite-dialog__product-intro">
					<div className="gsuite-dialog__product-name">
						{ /* Intentionally not translable as it is a brand name and Google keeps it in English */ }
						<span className="gsuite-dialog__product-logo">G Suite</span>
					</div>

					<p>
						{ translate(
							"We've teamed up with Google to offer you email, storage, docs, calendars, " +
								'and more, integrated with your site.'
						) }
					</p>

					<div className="gsuite-dialog__price-per-user">{ this.renderPrice() }</div>
				</div>

				<ul className="gsuite-dialog__product-features">
					<li className="gsuite-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_gmail_48dp.svg" alt="" />
						<p>
							{ translate( 'Professional email {{nowrap}}(@%(domain)s){{/nowrap}}', {
								args: { domain: this.props.domain },
								components: { nowrap: <span className="gsuite-dialog__domain" /> },
							} ) }
						</p>
					</li>

					<li className="gsuite-dialog__product-feature">
						<img src="/calypso/images/g-suite/logo_drive_48dp.svg" alt="" />
						<p>{ this.getStorageText() }</p>
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
}

export default localize( GoogleAppsProductDetails );
