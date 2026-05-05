import { isPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, ToggleControl } from '@wordpress/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component, type ReactNode } from 'react';
import { connect } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import { disableAutoRenew, enableAutoRenew } from 'calypso/lib/purchases/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { createNotice } from 'calypso/state/notices/actions';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import { isFetchingUserPurchases } from 'calypso/state/purchases/selectors';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isExpired, isOneTimePurchase, isRechargeable } from '../../../../lib/purchases';
import { getChangePaymentMethodPath } from '../../utils';
import AutoRenewDisablingDialog from './auto-renew-disabling-dialog';
import AutoRenewPaymentMethodDialog from './auto-renew-payment-method-dialog';
import type { GetChangePaymentMethodUrlFor, Purchase } from 'calypso/lib/purchases/types';
import type { NoticeStatus, NoticeText, NoticeOptions } from 'calypso/state/notices/types';

export interface AutoRenewToggleProps {
	purchase: Purchase;
	siteDomain: string;
	planName?: string;
	shouldDisable?: boolean;
	withTextStatus?: boolean;
	toggleSource?: string;
	getChangePaymentMethodUrlFor?: GetChangePaymentMethodUrlFor;
	paymentMethodUrl?: string;
	showLink?: boolean;
	label?: ReactNode;
	productSlug?: string;
	siteSlug?: string | null;
	children?: React.ReactNode;
}

export interface AutoRenewToggleConnectedProps {
	fetchingUserPurchases?: boolean;
	isEnabled: boolean;
	currentUserId: number | null;
	isAtomicSite: boolean;
	siteSlug?: string | null;
	fetchUserPurchases: ( userId: number ) => Promise< Purchase[] >;
	recordTracksEvent: (
		name: string,
		properties: Record< string, string | number | boolean | undefined | null >
	) => void;
	createNotice: ( status: NoticeStatus, text: NoticeText, noticeOptions?: NoticeOptions ) => void;
}

interface AutoRenewToggleState {
	pendingNotice?: [ NoticeStatus, NoticeText, NoticeOptions ] | null;
	showAutoRenewDisablingDialog: boolean;
	showPaymentMethodDialog: boolean;
	isRequesting: boolean;
	prefetchGiftingData: boolean;
}

class AutoRenewToggle extends Component<
	AutoRenewToggleProps & AutoRenewToggleConnectedProps & LocalizeProps,
	AutoRenewToggleState
> {
	state: AutoRenewToggleState = {
		pendingNotice: undefined,
		showAutoRenewDisablingDialog: false,
		showPaymentMethodDialog: false,
		isRequesting: false,
		prefetchGiftingData: false,
	};

	// Prefetch site settings/features on hover/focus so the gift checkbox in
	// the disable dialog renders without a visible delay.
	prefetchGiftingData = () => {
		if ( ! this.state.prefetchGiftingData && isPlan( this.props.purchase ) ) {
			this.setState( { prefetchGiftingData: true } );
		}
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

		page(
			( getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath )( siteSlug ?? '', purchase )
		);
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

	toggleAutoRenew = ( afterSuccess?: () => void ) => {
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

		updateAutoRenew( purchaseId, ( success: boolean ) => {
			this.setState( {
				isRequesting: false,
			} );

			if ( success ) {
				this.props.fetchUserPurchases( currentUserId ?? 0 );

				if ( isTogglingToward === false ) {
					this.setState( {
						pendingNotice: [
							'is-success',
							translate( 'Auto-renewal has been turned off successfully.' ),
							{ duration: 4000 },
						],
					} );
				}

				// Run any post-success follow-up the caller passed in. Skipped on failure so we
				// don't change the gift state when auto-renew didn't actually move.
				afterSuccess?.();

				return;
			}

			this.setState( {
				pendingNotice: [
					'is-error',
					isTogglingToward
						? translate( "We've failed to enable auto-renewal for you. Please try again." )
						: translate( "We've failed to disable auto-renewal for you. Please try again." ),
					{},
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

	shouldRender( purchase: Purchase ) {
		return ! isExpired( purchase ) && ! isOneTimePurchase( purchase );
	}

	render() {
		const { planName, siteDomain, purchase, withTextStatus, shouldDisable, showLink, children } =
			this.props;

		if ( ! showLink && ! this.shouldRender( purchase ) ) {
			return null;
		}

		let toggle;
		if ( showLink ) {
			toggle = this.isUpdatingAutoRenew() ? (
				'…'
			) : (
				<Button
					variant="link"
					className="is-link"
					onClick={ this.onToggleAutoRenew }
					onMouseEnter={ this.prefetchGiftingData }
					onFocus={ this.prefetchGiftingData }
					disabled={ shouldDisable || ! this.shouldRender( purchase ) }
				>
					{ children }
				</Button>
			);
		} else {
			toggle = (
				<span onMouseEnter={ this.prefetchGiftingData } onFocus={ this.prefetchGiftingData }>
					<ToggleControl
						checked={ this.getToggleUiStatus() }
						disabled={ this.isUpdatingAutoRenew() || shouldDisable }
						onChange={ this.onToggleAutoRenew }
						label={ this.props.label ?? ( withTextStatus ? this.renderTextStatus() : undefined ) }
					/>
				</span>
			);
		}

		return (
			<>
				{ this.state.prefetchGiftingData && purchase.siteId ? (
					<>
						<QuerySiteFeatures siteIds={ [ purchase.siteId ] } />
						<QuerySiteSettings siteId={ purchase.siteId } />
					</>
				) : null }
				{ toggle }
				<AutoRenewDisablingDialog
					isVisible={ this.state.showAutoRenewDisablingDialog }
					planName={ planName ? planName : '' }
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
	( state: IAppState, { purchase, siteSlug }: AutoRenewToggleProps ) => ( {
		fetchingUserPurchases: isFetchingUserPurchases( state ),
		isEnabled: purchase.isAutoRenewEnabled,
		currentUserId: getCurrentUserId( state ),
		// It's possible for this check to return null if this site is not connected (won't be in the sites array in state), but the prop types require a value
		isAtomicSite: isSiteAtomic( state, purchase.siteId ) ?? false,
		siteSlug: siteSlug || getSelectedSiteSlug( state ),
	} ),
	{
		fetchUserPurchases,
		recordTracksEvent,
		createNotice,
	}
)( localize( AutoRenewToggle ) );
