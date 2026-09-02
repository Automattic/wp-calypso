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
	isAkismetProduct,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CompactCard, Gridicon } from '@automattic/components';
import { invokeSurvicateEvent } from '@automattic/survicate';
import clsx from 'clsx';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component, type MouseEvent, type ReactNode } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import GSuiteCancellationPurchaseDialog from 'calypso/components/marketing-survey/gsuite-cancel-purchase-dialog';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import {
	isAkismetHoldingSitePurchase,
	isJetpackHoldingSitePurchase,
} from 'calypso/dashboard/utils/purchase';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import WordAdsEligibilityWarningDialog from 'calypso/me/purchases/wordads-eligibility-warning-dialog';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { removePurchase } from 'calypso/state/purchases/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { getName } from '../lib/raw-purchase-helpers';
import { MarketPlaceSubscriptionsDialog } from '../marketplace-subscriptions-dialog';
import { purchasesRoot } from '../paths';
import { isDataLoading } from '../utils';
import RemoveDomainDialog from './remove-domain-dialog';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';
import './style.scss';

interface RemovePurchaseOwnProps {
	hasLoadedSites: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
	hasNonPrimaryDomainsFlag?: boolean;
	hasSetupAds?: boolean;
	hasCustomPrimaryDomain?: boolean;
	purchase: Purchase;
	site?: SiteDetails | null;
	useVerticalNavItem?: boolean;
	onClickTracks?: ( event: MouseEvent ) => void;
	purchaseListUrl?: string;
	activeSubscriptions?: Purchase[];
	linkIcon?: string;
	skipRemovePlanSurvey?: boolean;
	className?: string;
	children?: ReactNode;
}

interface RemovePurchaseConnectedProps {
	isDomainOnlySite: boolean | null;
	isAtomicSite: boolean | null;
	isJetpack: boolean;
	isAkismet: boolean;
	userId: number | null;
	primaryDomain: ReturnType< typeof getPrimaryDomainBySiteId >;
	errorNotice: typeof errorNotice;
	receiveDeletedSite: typeof receiveDeletedSite;
	recordTracksEvent: typeof recordTracksEvent;
	removePurchase: typeof removePurchase;
	setAllSitesSelected: typeof setAllSitesSelected;
	successNotice: typeof successNotice;
}

type RemovePurchaseProps = RemovePurchaseOwnProps & RemovePurchaseConnectedProps & LocalizeProps;

interface RemovePurchaseState {
	isDialogVisible: boolean;
	isRemoving: boolean;
	isShowingNonPrimaryDomainWarning: boolean;
	isShowingMarketplaceSubscriptionsDialog: boolean;
	isShowingPreCancellationDialog: boolean;
	isShowingWordAdsEligibilityWarningDialog: boolean;
}

class RemovePurchase extends Component< RemovePurchaseProps, RemovePurchaseState > {
	static defaultProps = {
		purchaseListUrl: purchasesRoot,
	};

	state: RemovePurchaseState = {
		isDialogVisible: false,
		isRemoving: false,
		isShowingNonPrimaryDomainWarning: false,
		isShowingMarketplaceSubscriptionsDialog: false,
		isShowingPreCancellationDialog: false,
		isShowingWordAdsEligibilityWarningDialog: false,
	};

	closeDialog = () => {
		this.setState( {
			isDialogVisible: false,
			isShowingNonPrimaryDomainWarning: false,
			isShowingMarketplaceSubscriptionsDialog: false,
			isShowingPreCancellationDialog: false,
			isShowingWordAdsEligibilityWarningDialog: false,
		} );
	};

	showRemovePlanDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: false,
			isShowingNonPrimaryDomainWarning: false,
			isShowingPreCancellationDialog: false,
			isShowingWordAdsEligibilityWarningDialog: false,
			isDialogVisible: true,
		} );
	};

	openDialog = ( event: MouseEvent ) => {
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
				isShowingWordAdsEligibilityWarningDialog: false,
				isDialogVisible: false,
			} );
		} else if (
			this.shouldHandleMarketplaceSubscriptions() &&
			! this.state.isShowingMarketplaceSubscriptionsDialog
		) {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isShowingMarketplaceSubscriptionsDialog: true,
				isShowingWordAdsEligibilityWarningDialog: false,
				isDialogVisible: false,
			} );
		} else if (
			this.shouldShowWordAdsEligibilityWarning() &&
			! this.state.isShowingWordAdsEligibilityWarningDialog
		) {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isShowingMarketplaceSubscriptionsDialog: false,
				isShowingWordAdsEligibilityWarningDialog: true,
				isDialogVisible: false,
			} );
		} else {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isShowingMarketplaceSubscriptionsDialog: false,
				isShowingWordAdsEligibilityWarningDialog: false,
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
			activeSubscriptions?.forEach( ( s ) => this.handlePurchaseRemoval( s ) );
		}

		await this.handlePurchaseRemoval( purchase );
		invokeSurvicateEvent( 'purchaseRemoved' );

		page( purchaseListUrl ?? purchasesRoot );
	};

	handlePurchaseRemoval = async ( purchase: Purchase ) => {
		const { userId, isDomainOnlySite, translate } = this.props;

		try {
			await this.props.removePurchase( purchase.ID, userId );

			const productName = getName( purchase );
			let successMessage;

			successMessage = translate( '%(productName)s was removed from {{siteName/}}.', {
				args: { productName },
				components: { siteName: <em>{ purchase.domain }</em> },
			} );

			if ( isAkismetHoldingSitePurchase( purchase ) || isJetpackHoldingSitePurchase( purchase ) ) {
				successMessage = translate( '%(productName)s was removed from your account.', {
					args: { productName },
				} );
			}

			if ( isDomainRegistration( purchase ) ) {
				if ( isDomainOnlySite ) {
					this.props.receiveDeletedSite( purchase.blog_id );
					this.props.setAllSitesSelected();
				}

				successMessage = translate( 'The domain {{domain/}} was removed from your account.', {
					components: { domain: <em>{ productName }</em> },
				} );
			}

			this.props.successNotice( successMessage, { isPersistent: true } );
		} catch ( error ) {
			this.setState( { isRemoving: false } );
			this.closeDialog();
			this.props.errorNotice( ( error as Error ).message, { displayOnNextPage: true } );
		}
	};

	getChatButton = () => (
		<PrecancellationChatButton
			onClick={ this.onClickChatButton }
			purchase={ this.props.purchase }
			className="remove-domain-dialog__chat-button"
		/>
	);

	shouldShowNonPrimaryDomainWarning() {
		const { hasNonPrimaryDomainsFlag, isAtomicSite, hasCustomPrimaryDomain, purchase } = this.props;
		return (
			hasNonPrimaryDomainsFlag && isPlan( purchase ) && ! isAtomicSite && hasCustomPrimaryDomain
		);
	}

	shouldShowWordAdsEligibilityWarning() {
		const { hasSetupAds, purchase } = this.props;
		return hasSetupAds && isPlan( purchase );
	}

	renderNonPrimaryDomainWarningDialog() {
		const { hasSetupAds, purchase, site } = this.props;
		return (
			<NonPrimaryDomainDialog
				isDialogVisible={ this.state.isShowingNonPrimaryDomainWarning }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
				oldDomainName={ site?.domain }
				newDomainName={ site?.wpcom_url }
				hasSetupAds={ hasSetupAds }
			/>
		);
	}

	renderWordAdsEligibilityWarningDialog() {
		const { purchase } = this.props;
		return (
			<WordAdsEligibilityWarningDialog
				isDialogVisible={ this.state.isShowingWordAdsEligibilityWarningDialog }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
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
				onSurveyComplete={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	renderPlanDialog() {
		const { activeSubscriptions, purchase, skipRemovePlanSurvey } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				linkedPurchases={ activeSubscriptions }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onSurveyComplete={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
				skipRemovePlanSurvey={ skipRemovePlanSurvey }
			/>
		);
	}

	renderJetpackDialog() {
		const { purchase, purchaseListUrl } = this.props;

		return (
			<CancelJetpackForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				purchaseListUrl={ purchaseListUrl ?? purchasesRoot }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onSurveyComplete={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	shouldHandleMarketplaceSubscriptions() {
		const { activeSubscriptions } = this.props;

		return Boolean( activeSubscriptions?.length );
	}

	renderMarketplaceSubscriptionsDialog() {
		const { purchase, activeSubscriptions } = this.props;
		return (
			<MarketPlaceSubscriptionsDialog
				isDialogVisible={ this.state.isShowingMarketplaceSubscriptionsDialog }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
				activeSubscriptions={
					activeSubscriptions?.map( ( subscription ) => ( {
						id: subscription.ID,
						productName: subscription.product_name,
					} ) ) ?? []
				}
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

		// If we have a disconnected site that is _not_ a Jetpack purchase _or_ an Akismet purchase, no removal allowed.
		if ( ! this.props.site && ! this.props.isJetpack && ! this.props.isAkismet ) {
			return null;
		}

		const { className, purchase, translate, useVerticalNavItem } = this.props;
		const productName = getName( purchase );

		if ( ! purchase.is_removable ) {
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

		const wrapperClassName = clsx( 'remove-purchase__card', className );
		const Wrapper = useVerticalNavItem ? VerticalNavItem : CompactCard;
		const getWarningDialog = () => {
			if ( this.shouldShowNonPrimaryDomainWarning() ) {
				return this.renderNonPrimaryDomainWarningDialog();
			}

			if ( this.shouldHandleMarketplaceSubscriptions() ) {
				return this.renderMarketplaceSubscriptionsDialog();
			}

			if ( this.shouldShowWordAdsEligibilityWarning() ) {
				return this.renderWordAdsEligibilityWarningDialog();
			}

			return null;
		};

		return (
			<>
				<Wrapper tagName="button" className={ wrapperClassName } onClick={ this.openDialog }>
					{ this.props.children ? this.props.children : defaultContent }
					<Gridicon className="card__link-indicator" icon={ this.props.linkIcon || 'trash' } />
				</Wrapper>
				{ getWarningDialog() }
				{ this.renderDialog() }
			</>
		);
	}
}

function mapDispatchToProps( dispatch: CalypsoDispatch ) {
	return bindActionCreators(
		{
			errorNotice,
			receiveDeletedSite,
			recordTracksEvent,
			removePurchase,
			setAllSitesSelected,
			successNotice,
		},
		dispatch
	);
}

export default connect( ( state: AppState, { purchase }: RemovePurchaseOwnProps ) => {
	const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
	const isAkismet = purchase && isAkismetProduct( purchase );
	return {
		isDomainOnlySite: purchase && isDomainOnly( state, purchase.blog_id ),
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.blog_id ),
		isJetpack,
		isAkismet,
		userId: getCurrentUserId( state ),
		primaryDomain: getPrimaryDomainBySiteId( state, purchase.blog_id ),
	};
}, mapDispatchToProps )( localize( RemovePurchase ) );
