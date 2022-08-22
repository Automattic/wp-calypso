import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { disableAutoRenew, enableAutoRenew } from 'calypso/lib/purchases/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { createNotice } from 'calypso/state/notices/actions';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import { isFetchingUserPurchases } from 'calypso/state/purchases/selectors';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isExpired, isOneTimePurchase, isRechargeable } from '../../../../lib/purchases';
import { getChangePaymentMethodPath } from '../../utils';
import AutoRenewDisablingDialog from './auto-renew-disabling-dialog';
import AutoRenewPaymentMethodDialog from './auto-renew-payment-method-dialog';

class AutoRenewToggle extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		siteDomain: PropTypes.string.isRequired,
		planName: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		shouldDisable: PropTypes.bool,
		isAtomicSite: PropTypes.bool.isRequired,
		fetchingUserPurchases: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		withTextStatus: PropTypes.bool,
		toggleSource: PropTypes.string,
		siteSlug: PropTypes.string,
		getChangePaymentMethodUrlFor: PropTypes.func,
		paymentMethodUrl: PropTypes.string,
	};

	static defaultProps = {
		shouldDisable: false,
		fetchingUserPurchases: false,
		getChangePaymentMethodUrlFor: getChangePaymentMethodPath,
	};

	state = {
		showAutoRenewDisablingDialog: false,
		showPaymentMethodDialog: false,
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
		const {
			purchase,
			siteSlug,
			productSlug,
			isAtomicSite,
			toggleSource,
			getChangePaymentMethodUrlFor,
		} = this.props;
		this.closeAutoRenewPaymentMethodDialog();

		this.props.recordTracksEvent( 'calypso_auto_renew_no_payment_method_dialog_add_click', {
			product_slug: productSlug,
			is_atomic: isAtomicSite,
			toggle_source: toggleSource,
		} );

		page( getChangePaymentMethodUrlFor( siteSlug, purchase ) );
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
			isRequesting: true,
		} );

		updateAutoRenew( purchaseId, ( success ) => {
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

		return isEnabled ? translate( 'Auto-renew on' ) : translate( 'Auto-renew off' );
	}

	shouldRender( purchase ) {
		return ! isExpired( purchase ) && ! isOneTimePurchase( purchase );
	}

	render() {
		const { planName, siteDomain, purchase, withTextStatus, shouldDisable } = this.props;

		if ( ! this.shouldRender( purchase ) ) {
			return null;
		}

		return (
			<>
				<ToggleControl
					checked={ this.getToggleUiStatus() }
					disabled={ this.isUpdatingAutoRenew() || shouldDisable }
					onChange={ this.onToggleAutoRenew }
					label={ withTextStatus && this.renderTextStatus() }
				/>
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
	( state, { purchase, siteSlug } ) => ( {
		fetchingUserPurchases: isFetchingUserPurchases( state ),
		isEnabled: purchase.isAutoRenewEnabled,
		currentUserId: getCurrentUserId( state ),
		isAtomicSite: isSiteAtomic( state, purchase.siteId ),
		siteSlug: siteSlug || getSelectedSiteSlug( state ),
	} ),
	{
		fetchUserPurchases,
		recordTracksEvent,
		createNotice,
	}
)( localize( AutoRenewToggle ) );
