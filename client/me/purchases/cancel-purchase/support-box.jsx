/**
 * External Dependencies
 */
import React from 'react';

const CancelPurchaseSupportBox = React.createClass( {
	render() {
		const contactSupportUrl = 'https://support.wordpress.com/';

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
								a: <a href={ contactSupportUrl } target="_blank" />
							}
						}
					) }
				</p>

				<a href={ contactSupportUrl }
					target="_blank"
					className="button is-primary">
					{ this.translate( 'Contact Support' ) }
				</a>
			</div>
		);
	}
} );

export default CancelPurchaseSupportBox;
