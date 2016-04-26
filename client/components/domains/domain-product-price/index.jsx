/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' ),
	Popover = require( 'components/popover' );

var DomainProductPrice = React.createClass( {
	getInitialState() {
		return {
			popoverVisibleByClick: false,
			popoverVisibleByHover: false
		};
	},
	hidePopover() {
		this.setState( { popoverVisibleByClick: false, popoverVisibleByHover: false } );
	},
	showPopoverByClick() {
		this.setState( { popoverVisibleByClick: true } );
	},
	showPopoverByHover() {
		this.setState( { popoverVisibleByHover: true } );
	},
	hidePopoverByHover() {
		this.setState( { popoverVisibleByHover: false } );
	},
	subMessage() {
		var freeWithPlan = this.props.cart && this.props.cart.hasLoadedFromServer && this.props.cart.next_domain_is_free && ! this.props.isFinalPrice;
		if ( freeWithPlan ) {
			return <span className="domain-product-price__free-text">{ this.translate( 'Free with your plan' ) }</span>;
		} else if ( this.props.withPlansOnly && this.props.price ) {
			return (
				<small className="domain-product-price__premium-text" ref="subMessage" onClick={ this.showPopoverByClick } onMouseEnter={ this.showPopoverByHover } onMouseLeave={ this.hidePopoverByHover }>
					{ this.translate( 'Included in the Premium Plan' ) } <Gridicon icon="lock" size={ 12 }/>
					<Popover
						context={ this.refs && this.refs.subMessage }
						isVisible={ this.state.popoverVisibleByClick || this.state.popoverVisibleByHover }
						onClose={ this.hidePopover }
						className="domain-product-price__popover popover"
						position="bottom left">
						<div className="domain-product-price__popover-content">
							<h3>{ this.translate( 'Premium', { context: 'Premium Plan' } ) }</h3>
							<h5>{ this.priceMessage( this.props.products.value_bundle.cost_display ) }</h5>
							<ul className="domain-product-price__popover-items">
								{ [
									this.translate( 'A custom domain' ),
									this.translate( 'Advanced design customization' ),
									this.translate( '13GB of space for file and media' ),
									this.translate( 'Video Uploads' ),
									this.translate( 'No Ads' ),
									this.translate( 'Email and live chat support' )
								].map( ( message, i ) => <li key={ i }><Gridicon icon="checkmark-circle" size={ 18 }/> { message }</li> ) }
							</ul>
						</div>
					</Popover>
				</small>
			);
		}
		return null;
	},
	priceMessage( price ) {
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: price },
			components: { small: <small /> }
		} );
	},
	priceText() {
		if ( ! this.props.price ) {
			return this.translate( 'Free' );
		} else if ( this.props.withPlansOnly ) {
			return null;
		}
		return this.priceMessage( this.props.price );
	},
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
				<span className="domain-product-price__price">{ this.priceText() }</span>
				{ this.subMessage() }
			</div>
		);
	}
} );

module.exports = DomainProductPrice;
