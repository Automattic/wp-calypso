/**
 * External dependencies
 */
var React = require( 'react' ),
	Card = require( 'components/card' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'PaymentBox',

	render: function() {
		var cardClass = classNames( 'payment-box', this.props.classSet ),
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );
		return (
			<Card className={ cardClass }>
				<div className="box-padding">
					<h5 className="payment-box__title">{ this.props.title }</h5>
					<div className={ contentClass }>
						{ this.props.children }
					</div>
				</div>
			</Card>
		);
	}
} );
