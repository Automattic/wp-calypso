/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';

class GoogleAppsProductDetails extends Component {
	static propTypes = {
		price: PropTypes.string.isRequired
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
				</div>

				<div className="google-apps-dialog__product-features">
					<h5 className="google-apps-dialog__file-storage">
						{ translate( '30GB Online File Storage' ) }
					</h5>

					<h5 className="google-apps-dialog__professional-email">
						{ translate( 'Professional Email Address' ) }
					</h5>

					<h4 className="google-apps-dialog__price-per-user">
						{ translate( '%(price)s per user / month ', { args: { price: this.props.price } } ) }
					</h4>

					<h5 className="google-apps-dialog__billing-period">
						{ translate( 'Billed yearly — get 2 months free!' ) }
					</h5>
				</div>
			</div>
		);
	}
}

export default localize( GoogleAppsProductDetails );
