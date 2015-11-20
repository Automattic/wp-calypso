/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

var DomainProductPrice = React.createClass( {
	render: function() {
		var freeWithPlan = this.props.cart && this.props.cart.hasLoadedFromServer && this.props.cart.next_domain_is_free && ! this.props.isFinalPrice,
			classes = classNames( 'domain-product-price', { 'is-free-domain': freeWithPlan }, {
				'is-placeholder': this.props.isLoading
			} );

		if ( this.props.isLoading ) {
			return <div className={ classes }>{ this.translate( 'Loading…' ) }</div>;
		}

		return (
			<div className={ classes }>
				<span className="domain-product-price__price">
					{
						this.props.price ?
						this.translate( '%(cost)s {{small}}/year{{/small}}', {
							args: { cost: this.props.price },
							components: { small: <small /> }
						} ) :
						this.translate( 'Free' )
					}
				</span>

				{ freeWithPlan ? <span className="domain-product-price__free-text">{ this.translate( 'Free with your plan' ) }</span> : null }
			</div>
		);
	}
} );

module.exports = DomainProductPrice;
