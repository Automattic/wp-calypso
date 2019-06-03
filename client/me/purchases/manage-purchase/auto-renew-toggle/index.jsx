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
import { getCurrentUserId } from 'state/current-user/selectors';
import { isFetchingUserPurchases } from 'state/purchases/selectors';
import { fetchUserPurchases } from 'state/purchases/actions';
import AutoRenewDisablingDialog from './auto-renew-disabling-dialog';
import FormToggle from 'components/forms/form-toggle';

class AutoRenewToggle extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		siteDomain: PropTypes.string.isRequired,
		planName: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		fetchingUserPurchases: PropTypes.bool,
	};

	static defaultProps = {
		fetchingUserPurchases: false,
	};

	state = {
		showAutoRenewDisablingDialog: false,
		isTogglingToward: null,
		isRequesting: false,
	};

	onCloseAutoRenewDisablingDialog = () => {
		this.setState( {
			showAutoRenewDisablingDialog: false,
		} );
	};

	onToggleAutoRenew = () => {
		const {
			purchase: { id: purchaseId },
			currentUserId,
			isEnabled,
		} = this.props;

		if ( isEnabled ) {
			this.setState( {
				showAutoRenewDisablingDialog: true,
			} );
		}

		const updateAutoRenew = isEnabled ? disableAutoRenew : enableAutoRenew;

		this.setState( {
			isTogglingToward: ! isEnabled,
			isRequesting: true,
		} );

		updateAutoRenew( purchaseId, success => {
			this.setState( {
				isRequesting: false,
			} );
			if ( success ) {
				this.props.fetchUserPurchases( currentUserId );
			}
		} );
	};

	isUpdatingAutoRenew = () => {
		return this.state.isRequesting || this.props.fetchingUserPurchases;
	};

	getToggleUiStatus() {
		if ( this.isUpdatingAutoRenew() ) {
			return this.state.isTogglingToward;
		}

		return this.props.isEnabled;
	}

	render() {
		const { planName, siteDomain, purchase } = this.props;

		return (
			<>
				<FormToggle
					checked={ this.getToggleUiStatus() }
					disabled={ this.isUpdatingAutoRenew() }
					onChange={ this.onToggleAutoRenew }
				/>
				{ this.state.showAutoRenewDisablingDialog && (
					<AutoRenewDisablingDialog
						planName={ planName }
						siteDomain={ siteDomain }
						expiryDate={ purchase.expiryMoment.format( 'LL' ) }
						onClose={ this.onCloseAutoRenewDisablingDialog }
					/>
				) }
			</>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		fetchingUserPurchases: isFetchingUserPurchases( state ),
		isEnabled: ! isExpiring( purchase ),
		currentUserId: getCurrentUserId( state ),
	} ),
	{
		fetchUserPurchases,
	}
)( AutoRenewToggle );
