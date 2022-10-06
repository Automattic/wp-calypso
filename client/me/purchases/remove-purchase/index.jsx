/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackProduct,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import { Button, CompactCard, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import GSuiteCancellationPurchaseDialog from 'calypso/components/marketing-survey/gsuite-cancel-purchase-dialog';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getName, isRemovable } from 'calypso/lib/purchases';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { removePurchase } from 'calypso/state/purchases/actions';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { MarketPlaceSubscriptionsDialog } from '../marketplace-subscriptions-dialog';
import { purchasesRoot } from '../paths';
import { isDataLoading } from '../utils';
import RemoveDomainDialog from './remove-domain-dialog';

import './style.scss';

class RemovePurchase extends Component {
	static propTypes = {
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		hasNonPrimaryDomainsFlag: PropTypes.bool,
		isDomainOnlySite: PropTypes.bool,
		hasCustomPrimaryDomain: PropTypes.bool,
		receiveDeletedSite: PropTypes.func.isRequired,
		removePurchase: PropTypes.func.isRequired,
		purchase: PropTypes.object,
		site: PropTypes.object,
		setAllSitesSelected: PropTypes.func.isRequired,
		userId: PropTypes.number.isRequired,
		useVerticalNavItem: PropTypes.bool,
		onClickTracks: PropTypes.func,
		purchaseListUrl: PropTypes.string,
		activeSubscriptions: PropTypes.array,
		linkIcon: PropTypes.string,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
	};

	state = {
		isDialogVisible: false,
		isRemoving: false,
		isShowingNonPrimaryDomainWarning: false,
		isShowingMarketplaceSubscriptionsDialog: false,
	};

	closeDialog = () => {
		this.setState( {
			isDialogVisible: false,
			isShowingNonPrimaryDomainWarning: false,
			isShowingMarketplaceSubscriptionsDialog: false,
		} );
	};

	showRemovePlanDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: false,
			isShowingNonPrimaryDomainWarning: false,
			isDialogVisible: true,
		} );
	};

	openDialog = ( event ) => {
		event.preventDefault();

		if ( this.props.onClickTracks ) {
			this.props.onClickTracks( event );
		}
		if (
			this.shouldShowNonPrimaryDomainWarning() &&
			! this.state.isShowingNonPrimaryDomainWarning
		) {
			this.setState( {
				isShowingNonPrimaryDomainWarning: true,
				isShowingMarketplaceSubscriptionsDialog: false,
				isDialogVisible: false,
			} );
		} else if (
			this.shouldHandleMarketplaceSubscriptions() &&
			! this.state.isShowingMarketplaceSubscriptionsDialog
		) {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isShowingMarketplaceSubscriptionsDialog: true,
				isDialogVisible: false,
			} );
		} else {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isShowingMarketplaceSubscriptionsDialog: false,
				isDialogVisible: true,
			} );
		}
	};

	onClickChatButton = () => {
		this.setState( { isDialogVisible: false } );
	};

	removePurchase = async () => {
		this.setState( { isRemoving: true } );

		const { activeSubscriptions, purchaseListUrl, purchase } = this.props;

		// If the site has active Marketplace subscriptions, remove these as well
		if ( this.shouldHandleMarketplaceSubscriptions() ) {
			// no need to await here, as
			// - the success/error messages are handled for each request separately
			// - the plan removal is awaited below
			activeSubscriptions.forEach( ( s ) => this.handlePurchaseRemoval( s ) );
		}

		await this.handlePurchaseRemoval( purchase );

		page( purchaseListUrl );
	};

	handlePurchaseRemoval = async ( purchase ) => {
		const { userId, isDomainOnlySite, translate, purchasesError } = this.props;

		await this.props.removePurchase( purchase.id, userId );

		const productName = getName( purchase );
		let successMessage;

		if ( purchasesError ) {
			this.setState( { isRemoving: false } );
			this.closeDialog();
			this.props.errorNotice( purchasesError );
			return;
		}

		if ( isDomainRegistration( purchase ) ) {
			if ( isDomainOnlySite ) {
				this.props.receiveDeletedSite( purchase.siteId );
				this.props.setAllSitesSelected();
			}

			successMessage = translate( 'The domain {{domain/}} was removed from your account.', {
				components: { domain: <em>{ productName }</em> },
			} );
		} else {
			successMessage = translate( '%(productName)s was removed from {{siteName/}}.', {
				args: { productName },
				components: { siteName: <em>{ purchase.domain }</em> },
			} );
		}

		this.props.successNotice( successMessage, { isPersistent: true } );
	};

	getChatButton = () => (
		<PrecancellationChatButton
			onClick={ this.onClickChatButton }
			purchase={ this.props.purchase }
		/>
	);

	getContactUsButton = () => {
		return (
			<Button className="remove-purchase__support-link-button" href="/help/contact/">
				{ this.props.translate( 'Contact Us' ) }
			</Button>
		);
	};

	shouldShowNonPrimaryDomainWarning() {
		const { hasNonPrimaryDomainsFlag, isAtomicSite, hasCustomPrimaryDomain, purchase } = this.props;
		return (
			hasNonPrimaryDomainsFlag && isPlan( purchase ) && ! isAtomicSite && hasCustomPrimaryDomain
		);
	}

	renderNonPrimaryDomainWarningDialog() {
		const { purchase, site } = this.props;
		return (
			<NonPrimaryDomainDialog
				isDialogVisible={ this.state.isShowingNonPrimaryDomainWarning }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
				oldDomainName={ site.domain }
				newDomainName={ site.wpcom_url }
			/>
		);
	}

	renderDomainDialog() {
		return (
			<RemoveDomainDialog
				isRemoving={ this.state.isRemoving }
				isDialogVisible={ this.state.isDialogVisible }
				removePurchase={ this.removePurchase }
				closeDialog={ this.closeDialog }
				chatButton={ this.getChatButton() }
				purchase={ this.props.purchase }
			/>
		);
	}

	renderDomainMappingDialog() {
		const { purchase } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	renderPlanDialog() {
		const { purchase, activeSubscriptions } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				linkedPurchases={ activeSubscriptions }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	renderJetpackDialog() {
		const { purchase, purchaseListUrl } = this.props;

		return (
			<CancelJetpackForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				purchaseListUrl={ purchaseListUrl }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	shouldHandleMarketplaceSubscriptions() {
		const { activeSubscriptions } = this.props;

		return activeSubscriptions?.length > 0;
	}

	renderMarketplaceSubscriptionsDialog() {
		const { purchase, activeSubscriptions } = this.props;
		return (
			<MarketPlaceSubscriptionsDialog
				isDialogVisible={ this.state.isShowingMarketplaceSubscriptionsDialog }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
				activeSubscriptions={ activeSubscriptions }
			/>
		);
	}

	renderDialog() {
		const { purchase } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			return this.renderDomainDialog();
		}

		if ( isDomainMapping( purchase ) ) {
			return this.renderDomainMappingDialog();
		}

		if ( isDomainTransfer( purchase ) || isTitanMail( purchase ) ) {
			return this.renderPlanDialog();
		}

		if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
			return (
				<GSuiteCancellationPurchaseDialog
					isVisible={ this.state.isDialogVisible }
					onClose={ this.closeDialog }
					purchase={ purchase }
					site={ this.props.site }
				/>
			);
		}

		// Jetpack Plan or Product Cancellation
		if ( this.props.isJetpack ) {
			return this.renderJetpackDialog();
		}

		return this.renderPlanDialog();
	}

	render() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		// If we have a disconnected site that is _not_ a Jetpack purchase, no removal allowed.
		if ( ! this.props.site && ! this.props.isJetpack ) {
			return null;
		}

		const { className, purchase, translate, useVerticalNavItem } = this.props;
		const productName = getName( purchase );

		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		const defaultContent = (
			<>
				{
					// translators: productName is a product name, like Jetpack
					translate( 'Remove %(productName)s', { args: { productName } } )
				}
			</>
		);

		const wrapperClassName = classNames( 'remove-purchase__card', className );
		const Wrapper = useVerticalNavItem ? VerticalNavItem : CompactCard;

		return (
			<>
				<Wrapper tagName="button" className={ wrapperClassName } onClick={ this.openDialog }>
					{ this.props.children ? this.props.children : defaultContent }
					<Gridicon className="card__link-indicator" icon={ this.props.linkIcon || 'trash' } />
				</Wrapper>
				{ this.shouldShowNonPrimaryDomainWarning() && this.renderNonPrimaryDomainWarningDialog() }
				{ this.shouldHandleMarketplaceSubscriptions() &&
					this.renderMarketplaceSubscriptionsDialog() }
				{ this.renderDialog() }
			</>
		);
	}
}

export default connect(
	( state, { purchase } ) => {
		const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
		return {
			isDomainOnlySite: purchase && isDomainOnly( state, purchase.siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
			isChatAvailable: isHappychatAvailable( state ),
			isJetpack,
			purchasesError: getPurchasesError( state ),
			userId: getCurrentUserId( state ),
		};
	},
	{
		errorNotice,
		receiveDeletedSite,
		recordTracksEvent,
		removePurchase,
		setAllSitesSelected,
		successNotice,
	}
)( localize( RemovePurchase ) );
