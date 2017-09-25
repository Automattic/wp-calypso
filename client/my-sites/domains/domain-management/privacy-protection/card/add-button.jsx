import page from 'page';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { cartItems } from 'lib/cart-values';
import config from 'config';
import upgradesActions from 'lib/upgrades/actions';

class AddButton extends React.PureComponent {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired
	};

	render() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<button
				type="button"
				className="button is-primary"
				onClick={ this.addPrivacyProtection }>
				{ this.props.translate( 'Add Privacy Protection' ) }
			</button>
		);
	}

	addPrivacyProtection = () => {
		upgradesActions.addItem(
			cartItems.domainPrivacyProtection( { domain: this.props.selectedDomainName } )
		);

		page( '/checkout/' + this.props.selectedSite.slug );
	}
}

export default localize( AddButton );
