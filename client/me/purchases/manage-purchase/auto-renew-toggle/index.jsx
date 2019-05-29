/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isExpiring } from 'lib/purchases';
import { disableAutoRenew, enableAutoRenew } from 'lib/upgrades/actions';
import { isFetchingSitePurchases } from 'state/purchases/selectors';
import { fetchSitePurchases } from 'state/purchases/actions';
import AutorenewalDisablingDialog from '../autorenewal-disabling-dialog';
import FormToggle from 'components/forms/form-toggle';

class AutoRenewToggle extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		siteDomain: PropTypes.string.isRequired,
		planName: PropTypes.string.isRequired,
		isAutorenewalEnabled: PropTypes.bool.isRequired,
		fetchingSitePurchases: PropTypes.bool,
	};

	static defaultProps = {
		fetchingSitePurchases: false,
	};

	state = {
		showAutorenewalDisablingDialog: false,
		isTogglingToward: null,
		isRequestingAutoRenew: false,
	};

	onCloseAutorenewalDisablingDialog = () => {
		this.setState( {
			showAutorenewalDisablingDialog: false,
		} );
	};

	onToggleAutorenewal = () => {
		const {
			purchase: { id: purchaseId, siteId },
			isAutorenewalEnabled,
		} = this.props;

		if ( isAutorenewalEnabled ) {
			this.setState( {
				showAutorenewalDisablingDialog: true,
			} );
		}

		const updateAutoRenew = isAutorenewalEnabled ? disableAutoRenew : enableAutoRenew;

		this.setState( {
			isTogglingToward: ! isAutorenewalEnabled,
			isRequestingAutoRenew: true,
		} );

		updateAutoRenew( purchaseId, success => {
			this.setState( {
				isRequestingAutoRenew: false,
			} );
			if ( success ) {
				this.props.fetchSitePurchases( siteId );
			}
		} );
	};

	isUpdatingAutoRenew = () => {
		return this.state.isRequestingAutoRenew || this.props.fetchingSitePurchases;
	};

	getToggleUiStatus() {
		if ( this.isUpdatingAutoRenew() ) {
			return this.state.isTogglingToward;
		}

		return this.props.isAutorenewalEnabled;
	}

	render() {
		const { planName, siteDomain, purchase } = this.props;

		return (
			<>
				<FormToggle
					checked={ this.getToggleUiStatus() }
					disabled={ this.isUpdatingAutoRenew() }
					onChange={ this.onToggleAutorenewal }
				/>
				{ this.state.showAutorenewalDisablingDialog && (
					<AutorenewalDisablingDialog
						planName={ planName }
						siteDomain={ siteDomain }
						expiryDate={ purchase.expiryMoment.format( 'LL' ) }
						onClose={ this.onCloseAutorenewalDisablingDialog }
					/>
				) }
			</>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		fetchingSitePurchases: isFetchingSitePurchases( state ),
		isAutorenewalEnabled: ! isExpiring( purchase ),
	} ),
	{
		fetchSitePurchases,
	}
)( AutoRenewToggle );
