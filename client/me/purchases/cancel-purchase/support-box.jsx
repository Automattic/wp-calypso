/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';

const CancelPurchaseSupportBox = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired,
	},

	trackClickContactSupport() {
		analytics.tracks.recordEvent(
			'calypso_purchases_click_contact_support',
			{ product_slug: this.props.purchase.productSlug }
		);
	},

	render() {
		const contactSupportUrl = '/help/contact';

		return (
			<div className="cancel-purchase-support-box">
				<h3>
					{ this.translate( 'Have questions?' ) }
					<br />
					{ this.translate( 'We\'re here to help!' ) }
				</h3>

				<p>
					{ this.translate(
						'If you are unsure about canceling or have any questions about this purchase, please {{a}}contact support{{/a}}.',
						{
							components: {
								a: <a href={ contactSupportUrl } target="_blank" onClick={ this.trackClickContactSupport } />
							}
						}
					) }
				</p>

				<a href={ contactSupportUrl }
					target="_blank"
					onClick={ this.trackClickContactSupport }
					className="button is-primary">
					{ this.translate( 'Contact Support' ) }
				</a>
			</div>
		);
	}
} );

export default CancelPurchaseSupportBox;
