/**
 * External dependencies
 */
var React = require( 'react' );
/**
 * Internal dependencies
 */
var cartValues = require( 'lib/cart-values' ),
	getRefundPolicy = cartValues.getRefundPolicy,
	cartItems = cartValues.cartItems;

var SupportingText = React.createClass( {

	creditCardSupportingText: function() {
		var cart = this.props.cart,
			title,
			content;

		if ( cartItems.hasFreeTrial( cart ) ) {
			title = this.translate( 'Why do you need my credit card?' );
			content = this.translate( 'You will only be charged at the end of the trial. Cancel any time before then and pay nothing.' );
		} else {
			title = this.translate( 'Easy Refunds' );
			content = this.refundText();
		}

		return this.supportingTextBox( 'credit-card-supporting-text', title, content );
	},

	refundText: function() {
		var refundDocsLink = (
			<a className="credit-card-supporting-text__refund-link"
				href="https://en.support.wordpress.com/refunds/"
				target="_blank" />
		);

		switch ( getRefundPolicy( this.props.cart ) ) {
			case 'genericRefund':
				return this.translate( 'You can cancel within 30 days for a {{a}}full refund{{/a}}. No questions asked.', {
					components: { a: refundDocsLink }
				} );

			case 'planWithDomainRefund':
				return this.translate( 'You can cancel within 30 days for a {{a}}partial refund{{/a}}. No questions asked.', {
					components: { a: refundDocsLink }
				} );

			case 'domainRefund':
				return this.translate( 'You can cancel within 48 hours for a {{a}}full refund{{/a}}. No questions asked.', {
					components: { a: refundDocsLink }
				} );
		}
	},

	liveChatSupportingText: function() {
		var cart = this.props.cart,
			title = this.translate( 'Get Support' ),
			content = this.translate( 'Need help? Our Happiness Engineers can help you setup your site & answer questions.' );

		if ( cartItems.hasProduct( cart, 'business-bundle' ) ) {
			title = this.translate( 'Live Chat Support?' );
			content = this.translate( 'Need help? Our Happiness Engineers can help you setup your site & answer questions.' );
		}

		return this.supportingTextBox( 'live-chat-supporting-text', title, content );
	},

	supportingTextBox: function( className, title, content ) {
		return (
			<li className={ className }>
				<h6>{ title }</h6>
				<p>{ content }</p>
			</li>
		);
	},

	render: function() {
		return (
			<ul className="supporting-text">
				{ this.creditCardSupportingText() }
				{ this.liveChatSupportingText() }
			</ul>
		);
	}

} );

module.exports = SupportingText;
