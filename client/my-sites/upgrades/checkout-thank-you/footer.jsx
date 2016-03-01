/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { isJetpackPlan } from 'lib/products-values';

const CheckoutThankYouFooter = React.createClass( {
	propTypes: {
		isDataLoaded: React.PropTypes.bool.isRequired,
		receipt: React.PropTypes.object.isRequired
	},

	getText() {
		if ( ! this.props.isDataLoaded ) {
			return this.translate( 'Loading…' );
		}

		if ( this.props.receipt.data.purchases.some( isJetpackPlan ) ) {
			return this.translate(
				'Check out our {{supportDocsLink}}support docs{{/supportDocsLink}} ' +
				'or {{contactLink}}contact us{{/contactLink}}.',
				{
					components: {
						supportDocsLink: <a href={ 'http://jetpack.me/support/' } target="_blank" />,
						contactLink: <a href={ 'http://jetpack.me/contact-support/' } target="_blank" />
					}
				}
			);
		}

		return this.translate(
			'Check out our {{supportDocsLink}}support docs{{/supportDocsLink}}, ' +
			'search for tips and tricks in {{forumLink}}the forum{{/forumLink}}, ' +
			'or {{contactLink}}contact us{{/contactLink}}.',
			{
				components: {
					supportDocsLink: <a href="http://support.wordpress.com" target="_blank" />,
					forumLink: <a href="http://forums.wordpress.com" target="_blank" />,
					contactLink: <a href={ '/help/contact' } />
				}
			}
		);
	},

	render() {
		return (
			<Card className="checkout-thank-you__footer">
				<div className="checkout-thank-you__footer-content">
					<h3 className="checkout-thank-you__footer-heading">
						{ this.translate( 'Questions? Need Help?' ) }
					</h3>

					<p className="checkout-thank-you__footer-text">
						{ this.getText() }
					</p>
				</div>
			</Card>
		);
	}
} );

export default CheckoutThankYouFooter;
