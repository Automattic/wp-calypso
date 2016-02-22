/**
 * External dependencies
 */
var React = require( 'react' );
/**
 * Internal dependencies
 */
var cartValues = require( 'lib/cart-values' ),
	support = require( 'lib/url/support' ),
	getRefundPolicy = cartValues.getRefundPolicy,
	cartItems = cartValues.cartItems,
	hasFreeTrial = cartItems.hasFreeTrial,
	abtest = require( 'lib/abtest' ).abtest;

var SupportingText = React.createClass( {

	creditCardSupportingText: function() {
		var title,
			content;

		title = this.translate( 'Easy Refunds' );
		content = this.refundText();

		return this.supportingTextBox( 'credit-card-supporting-text', title, content );
	},

	refundText: function() {
		var refundDocsLink = (
			<a className="credit-card-supporting-text__refund-link"
				href={ support.REFUNDS }
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
			content = this.translate( 'Need help? Our Happiness Engineers can help you set up your site & answer questions.' );

		if ( cartItems.hasProduct( cart, 'business-bundle' ) ) {
			title = this.translate( 'Live Chat Support?' );
			content = this.translate( 'Need help? Our Happiness Engineers can help you set up your site & answer questions.' );
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
		if ( abtest( 'checkoutFooter' ) === 'noFooter' ) {
			return null;
		}

		return hasFreeTrial( this.props.cart )
		? null : (
				<ul className="supporting-text">
					{ this.creditCardSupportingText() }
					{ this.liveChatSupportingText() }
				</ul>
			);
	}

} );

module.exports = SupportingText;
