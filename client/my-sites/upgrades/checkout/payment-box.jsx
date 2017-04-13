/**
 * External dependencies
 */
var React = require( 'react' ),
	Card = require( 'components/card' ),
	classNames = require( 'classnames' );

import SectionHeader from 'components/section-header';

module.exports = React.createClass( {
	displayName: 'PaymentBox',

	render: function() {
		var cardClass = classNames( 'payment-box', this.props.classSet ),
			contentClass = classNames( 'payment-box__content', this.props.contentClassSet );
		return (
			<div>
				<SectionHeader label={ this.props.title } />
				<Card className={ cardClass }>
					<div className="checkout__box-padding">
						<div className={ contentClass }>
							{ this.props.children }
						</div>
					</div>
				</Card>
			</div>
		);
	}
} );
