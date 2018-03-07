/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import GoogleAppsDialog from './google-apps-dialog';
import HeaderCake from 'components/header-cake';
import { getSelectedSite } from 'state/ui/selectors';

class GoogleApps extends Component {
	static propTypes = {
		cart: PropTypes.object,
		domain: PropTypes.string.isRequired,
		onGoBack: PropTypes.func.isRequired,
		onAddGoogleApps: PropTypes.func.isRequired,
		onClickSkip: PropTypes.func.isRequired,
		onSave: PropTypes.func,
		initialState: PropTypes.object,
		analyticsSection: PropTypes.string,
		initialGoogleAppsCartItem: PropTypes.object,
	};

	static defaultProps = {
		analyticsSection: 'domains',
	};

	componentDidMount() {
		this.checkDomainInCart();
	}

	componentDidUpdate() {
		this.checkDomainInCart();
	}

	checkDomainInCart() {
		if ( ! this.props.cart || ! this.props.cart.hasLoadedFromServer ) {
			return;
		}

		if ( ! cartItems.hasDomainInCart( this.props.cart, this.props.domain ) ) {
			// Should we handle this more gracefully?
			this.props.onGoBack();
		}
	}

	render() {
		return (
			<div>
				<HeaderCake onClick={ this.props.onGoBack }>
					{ this.props.translate( 'Register %(domain)s', { args: { domain: this.props.domain } } ) }
				</HeaderCake>
				<GoogleAppsDialog
					domain={ this.props.domain }
					onClickSkip={ this.props.onClickSkip }
					onGoBack={ this.props.onGoBack }
					onAddGoogleApps={ this.props.onAddGoogleApps }
					selectedSite={ this.props.selectedSite }
					analyticsSection={ this.props.analyticsSection }
					onSave={ this.props.onSave }
					initialState={ this.props.initialState }
					initialGoogleAppsCartItem={ this.props.initialGoogleAppsCartItem }
				/>
			</div>
		);
	}
}

export default connect( state => {
	return {
		selectedSite: getSelectedSite( state ),
	};
} )( localize( GoogleApps ) );
