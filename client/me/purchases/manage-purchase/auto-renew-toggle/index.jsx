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
import { isExpiring } from 'lib/purchases';
import { disableAutoRenew, enableAutoRenew } from 'lib/upgrades/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isFetchingUserPurchases } from 'state/purchases/selectors';
import { fetchUserPurchases } from 'state/purchases/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import { errorNotice } from 'state/notices/actions';
import AutoRenewDisablingDialog from './auto-renew-disabling-dialog';
import FormToggle from 'components/forms/form-toggle';

class AutoRenewToggle extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		siteDomain: PropTypes.string.isRequired,
		planName: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		fetchingUserPurchases: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		errorNotice: PropTypes.func.isRequired,
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

	toggleAutoRenew = () => {
		const {
			purchase: { id: purchaseId, productSlug },
			currentUserId,
			isEnabled,
			isAtomicSite,
			translate,
		} = this.props;

		const updateAutoRenew = isEnabled ? disableAutoRenew : enableAutoRenew;
		const isTogglingToward = ! isEnabled;

		this.setState( {
			isTogglingToward,
			isRequesting: true,
		} );

		updateAutoRenew( purchaseId, success => {
			this.setState( {
				isRequesting: false,
			} );

			if ( ! success ) {
				this.props.errorNotice(
					isTogglingToward
						? translate( "We've failed to enable auto-renewal for you. Please try again." )
						: translate( "We've failed to disable auto-renewal for you. Please try again." )
				);
			}

			this.props.fetchUserPurchases( currentUserId );
		} );

		this.props.recordTracksEvent( 'calypso_purchases_manage_purchase_toggle_auto_renew', {
			product_slug: productSlug,
			is_atomic: isAtomicSite,
			is_toggling_toward: isTogglingToward,
		} );
	};

	onToggleAutoRenew = () => {
		const { isEnabled } = this.props;

		if ( isEnabled ) {
			this.setState( {
				showAutoRenewDisablingDialog: true,
			} );
			return;
		}

		this.toggleAutoRenew();
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
						purchase={ purchase }
						siteDomain={ siteDomain }
						onClose={ this.onCloseAutoRenewDisablingDialog }
						onConfirm={ this.toggleAutoRenew }
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
		isAtomicSite: isSiteAtomic( state, purchase.siteId ),
	} ),
	{
		fetchUserPurchases,
		recordTracksEvent,
		errorNotice,
	}
)( localize( AutoRenewToggle ) );
