import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

export class CartButtons extends Component {
	static propTypes = {
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className="cart-buttons">
				<Button className="cart-checkout-button" primary onClick={ this.goToCheckout }>
					{ this.props.translate( 'Checkout', { context: 'Cart button' } ) }
				</Button>
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}

	goToCheckout = ( event ) => {
		event.preventDefault();
		this.props.recordGoogleEvent( 'Domain Search', 'Click "Checkout" Button on Popup Cart' );
		page( '/checkout/' + this.props.selectedSite.slug );
	};
}

export default connect( null, { recordGoogleEvent } )( localize( CartButtons ) );
