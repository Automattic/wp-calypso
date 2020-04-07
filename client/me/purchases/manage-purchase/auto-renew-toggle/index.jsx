/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { isExpiring } from 'lib/purchases';
import { disableAutoRenew, enableAutoRenew } from 'lib/purchases/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isFetchingUserPurchases } from 'state/purchases/selectors';
import { fetchUserPurchases } from 'state/purchases/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import { createNotice } from 'state/notices/actions';
import AutoRenewDisablingDialog from './auto-renew-disabling-dialog';
import AutoRenewPaymentMethodDialog from './auto-renew-payment-method-dialog';
import FormToggle from 'components/forms/form-toggle';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { isExpired, isOneTimePurchase, isRechargeable } from '../../../../lib/purchases';
import { getEditCardDetailsPath } from '../../utils';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class AutoRenewToggle extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		siteDomain: PropTypes.string.isRequired,
		planName: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		fetchingUserPurchases: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		compact: PropTypes.bool,
		withTextStatus: PropTypes.bool,
		toggleSource: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		fetchingUserPurchases: false,
	};

	state = {
		showAutoRenewDisablingDialog: false,
		showPaymentMethodDialog: false,
		isTogglingToward: null,
		isRequesting: false,
	};

	componentDidUpdate() {
		if ( ! this.state.showAutoRenewDisablingDialog && this.state.pendingNotice ) {
			this.props.createNotice( ...this.state.pendingNotice );

			// the blocking condition above will safely block this from causing infinite update loop.
			/* eslint-disable-next-line react/no-did-update-set-state */
			this.setState( {
				pendingNotice: null,
			} );
		}
	}

	onCloseAutoRenewDisablingDialog = () => {
		this.setState( {
			showAutoRenewDisablingDialog: false,
		} );
	};

	closeAutoRenewPaymentMethodDialog() {
		this.setState( {
			showPaymentMethodDialog: false,
		} );
	}

	goToUpdatePaymentMethod = () => {
		const { purchase, siteSlug, productSlug, isAtomicSite, toggleSource } = this.props;
		this.closeAutoRenewPaymentMethodDialog();

		this.props.recordTracksEvent( 'calypso_auto_renew_no_payment_method_dialog_add_click', {
			product_slug: productSlug,
			is_atomic: isAtomicSite,
			toggle_source: toggleSource,
		} );

		page( getEditCardDetailsPath( siteSlug, purchase ) );
	};

	onCloseAutoRenewPaymentMethodDialog = () => {
		const { productSlug, isAtomicSite, toggleSource } = this.props;
		this.closeAutoRenewPaymentMethodDialog();

		this.props.recordTracksEvent( 'calypso_auto_renew_no_payment_method_dialog_close', {
			product_slug: productSlug,
			is_atomic: isAtomicSite,
			toggle_source: toggleSource,
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

		const recordEvent = () => {
			this.props.recordTracksEvent( 'calypso_purchases_manage_purchase_toggle_auto_renew', {
				product_slug: productSlug,
				is_atomic: isAtomicSite,
				is_toggling_toward: isTogglingToward,
				toggle_source: this.props.toggleSource,
			} );
		};

		if ( isTogglingToward && ! isRechargeable( this.props.purchase ) ) {
			this.setState( {
				showPaymentMethodDialog: true,
			} );
			recordEvent();
			return;
		}

		this.setState( {
			isTogglingToward,
			isRequesting: true,
		} );

		updateAutoRenew( purchaseId, success => {
			this.setState( {
				isRequesting: false,
			} );

			if ( success ) {
				this.props.fetchUserPurchases( currentUserId );

				if ( isTogglingToward === false ) {
					this.setState( {
						pendingNotice: [
							'is-success',
							translate( 'Auto-renewal has been turned off successfully.' ),
							{ duration: 4000 },
						],
					} );
				}

				return;
			}

			this.setState( {
				pendingNotice: [
					'is-error',
					isTogglingToward
						? translate( "We've failed to enable auto-renewal for you. Please try again." )
						: translate( "We've failed to disable auto-renewal for you. Please try again." ),
				],
			} );
		} );

		recordEvent();
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
		return this.props.isEnabled;
	}

	renderTextStatus() {
		const { translate, isEnabled } = this.props;

		if ( this.isUpdatingAutoRenew() ) {
			return translate( 'Auto-renew (…)' );
		}

		return isEnabled ? translate( 'Auto-renew (on)' ) : translate( 'Auto-renew (off)' );
	}

	shouldRender( purchase ) {
		return ! isExpired( purchase ) && ! isOneTimePurchase( purchase );
	}

	render() {
		const { planName, siteDomain, purchase, compact, withTextStatus } = this.props;

		if ( ! this.shouldRender( purchase ) ) {
			return null;
		}

		const ToggleComponent = compact ? CompactFormToggle : FormToggle;

		return (
			<>
				<ToggleComponent
					checked={ this.getToggleUiStatus() }
					disabled={ this.isUpdatingAutoRenew() }
					toggling={ this.isUpdatingAutoRenew() }
					onChange={ this.onToggleAutoRenew }
				>
					{ withTextStatus && this.renderTextStatus() }
				</ToggleComponent>
				<AutoRenewDisablingDialog
					isVisible={ this.state.showAutoRenewDisablingDialog }
					planName={ planName }
					purchase={ purchase }
					siteDomain={ siteDomain }
					onClose={ this.onCloseAutoRenewDisablingDialog }
					onConfirm={ this.toggleAutoRenew }
				/>
				<AutoRenewPaymentMethodDialog
					isVisible={ this.state.showPaymentMethodDialog }
					purchase={ purchase }
					onClose={ this.onCloseAutoRenewPaymentMethodDialog }
					onAddClick={ this.goToUpdatePaymentMethod }
				/>
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
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		fetchUserPurchases,
		recordTracksEvent,
		createNotice,
	}
)( localize( AutoRenewToggle ) );
