/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { showCartOnMobile } from 'lib/upgrades/actions';

class CartToggle extends Component {
	constructor( props ) {
		super( props );
		this.state = { isShowingCartOnMobile: false };
	}

	toggleCartOnMobile = ( event ) => {
		event.preventDefault();

		const show = ! this.state.isShowingCartOnMobile;
		this.setState( { isShowingCartOnMobile: show } );
		showCartOnMobile( show );
	};

	render() {
		const label = this.state.isShowingCartOnMobile
			? this.props.translate( 'Hide order summary' )
			: this.props.translate( 'Show order summary' );
		return <a className="checkout__summary-toggle" onClick={ this.toggleCartOnMobile }>{ label }</a>;
	}
}

export default localize( CartToggle );
