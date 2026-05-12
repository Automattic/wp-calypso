import { removePurchase as removePurchaseRequest } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import {
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	hasMarketplaceProduct,
	isJetpackPlan,
	isJetpackProduct,
	isAkismetProduct,
	getPlan,
	getMonthlyPlanByYearly,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { invokeSurvicateEvent } from '@automattic/survicate';
import { useCanConnectToZendeskMessaging } from '@automattic/zendesk-client';
import { Button as GutenbergButton } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component, useCallback } from 'react';
import { connect } from 'react-redux';
import BackupRetentionOptionOnCancelPurchase from 'calypso/components/backup-retention-management/retention-option-on-cancel-purchase';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import {
	getCancellationHeading,
	getCheckboxLabel,
	getButtonLabels,
} from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import { getProductNounForCategory } from 'calypso/dashboard/me/billing-purchases/purchase-settings/classify-purchase-for-copy';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getName,
	hasAmountAvailableToRefund,
	canAutoRenewBeTurnedOff,
	isRefundable,
	isSubscription,
} from 'calypso/lib/purchases';
import {
	cancelPurchaseAsync,
	cancelAndRefundPurchaseAsync,
	cancelAndRefundPurchase,
	extendPurchaseWithFreeMonth,
} from 'calypso/lib/purchases/actions';
import { getMutationFlowType, getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import CancelPurchaseLoadingPlaceholder from 'calypso/me/purchases/cancel-purchase/loading-placeholder';
import { classifyPurchaseForCopy } from 'calypso/me/purchases/manage-purchase/classify-purchase-for-copy';
import { managePurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	clearPurchases,
	removePurchaseFromState,
	restorePurchaseToState,
} from 'calypso/state/purchases/actions';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	getIncludedDomainPurchase,
	getDowngradePlanFromPurchase,
} from 'calypso/state/purchases/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import AtomicRevertChanges from './atomic-revert-changes';
import CancelPurchaseButton from './button';
import CancelPurchaseDomainOptions, { willShowDomainOptionsRadioButtons } from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import RefundEligibilityNotice from './refund-eligibility-notice';
import TimeRemainingNotice from './time-remaining-notice';
import { toPurchaseForCopy } from './to-purchase-for-copy';
import type { UpgradesCancelFeaturesResponse } from '@automattic/api-core';
import type { Purchases, SiteDetails } from '@automattic/data-stores';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

function ContactSupportButton( {
	purchase,
	displayVariant,
	children,
	...props
}: {
	purchase: { siteId: number; siteUrl: string; productName: string };
	displayVariant: 'cancel' | 'remove';
	children?: ReactNode;
} & ButtonHTMLAttributes< HTMLButtonElement > ) {
	const { setShowHelpCenter, setNavigateToRoute, setNewMessagingChat } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();

	const handleClick = useCallback( () => {
		if ( canConnectToZendeskMessaging ) {
			setNewMessagingChat( {
				initialMessage:
					displayVariant === 'remove'
						? `I have questions about removing my ${ purchase.productName }. Can I speak with a human?`
						: `I have questions about canceling my ${ purchase.productName }. Can I speak with a human?`,
				siteUrl: purchase.siteUrl,
				siteId: String( purchase.siteId ),
			} );
		} else {
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
		}
	}, [
		canConnectToZendeskMessaging,
		displayVariant,
		purchase.productName,
		purchase.siteUrl,
		purchase.siteId,
		setNewMessagingChat,
		setNavigateToRoute,
		setShowHelpCenter,
	] );

	return (
		<GutenbergButton variant="link" onClick={ handleClick } { ...props }>
			{ children }
		</GutenbergButton>
	);
}

interface MomentProps {
	moment: typeof moment;
}

export interface CancelPurchaseState {
	cancelBundledDomain: boolean;
	confirmCancelBundledDomain: boolean;
	surveyShown: boolean;
	atomicRevertConfirmed: boolean;
	customerConfirmedUnderstanding: boolean;
	isLoading: boolean;
	domainConfirmationConfirmed: boolean;
	showDomainOptionsStep: boolean;
	showDialog: boolean;
	cancelIntent: 'refund' | 'autorenew' | null;
	fireMutationWasRefund: boolean;
}

export interface CancelPurchaseActions {
	recordTracksEvent: (
		name: string,
		properties: { [ key: string ]: string | boolean | number }
	) => void;
	clearPurchases: () => void;
	refreshSitePlans: ( siteId: string | number ) => void;
	removePurchaseFromState: ( purchaseId: string | number ) => Purchases.RawPurchase | null;
	restorePurchaseToState: ( purchase: Purchases.RawPurchase ) => void;
	successNotice: (
		message: string | ReactNode,
		properties: {
			displayOnNextPage?: boolean;
			duration?: number;
			button?: string;
			href?: string;
		}
	) => void;
	errorNotice: ( message: string | ReactNode ) => void;
}

export interface CancelPurchaseConnectedProps {
	atomicTransfer: { created_at: string };
	hasLoadedSites: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
	includedDomainPurchase: Purchases.Purchase;
	isAkismet: boolean;
	isDomainRegistrationPurchase: boolean;
	isHundredYearDomain: boolean | undefined;
	isJetpack: boolean;
	isJetpackPurchase: boolean;
	isSplitCancelRemoveEnabled: boolean;
	productsList: Record< string, { product_type: string; billing_product_slug: string } >;
	purchase: Purchases.Purchase;
	purchases: Purchases.Purchase[];
	site: SiteDetails;
}

export interface CancelPurchaseProps {
	getManagePurchaseUrlFor?: GetManagePurchaseUrlFor;
	getConfirmCancelDomainUrlFor?: (
		targetSiteSlug: string,
		targetPurchaseId: string | number
	) => string;
	purchaseId: number;
	purchaseListUrl?: string;
	siteSlug: string;
	intent?: 'cancel' | 'remove' | null;
	purchaseCancelFeatures?: UpgradesCancelFeaturesResponse;
	isPurchaseCancelFeaturesLoading?: boolean;
}

export type CancelPurchaseAllProps = CancelPurchaseProps &
	CancelPurchaseConnectedProps &
	LocalizeProps &
	MomentProps &
	CancelPurchaseActions;

class CancelPurchase extends Component< CancelPurchaseAllProps, CancelPurchaseState > {
	state = {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
		surveyShown: false,
		atomicRevertConfirmed: false,
		customerConfirmedUnderstanding: false,
		isLoading: false,
		domainConfirmationConfirmed: false,
		showDomainOptionsStep: false,
		// Cancellation state moved from button component
		showDialog: false,
		cancelIntent: null,
		fireMutationWasRefund: false,
	};

	onCustomerConfirmedUnderstandingChange = ( checked: boolean ) => {
		this.setState( { customerConfirmedUnderstanding: checked } );
	};

	componentDidMount() {
		if ( ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	componentDidUpdate( prevProps: CancelPurchaseAllProps ) {
		if ( this.state.surveyShown ) {
			return;
		}

		if ( this.isDataValid( prevProps ) && ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	isDataValid = ( props = this.props ) => {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { purchase } = props;

		if ( ! purchase ) {
			return false;
		}

		const isDomainTransferCancelable = isRefundable( purchase ) || ! isDomainTransfer( purchase );
		const isValidForCancellation =
			canAutoRenewBeTurnedOff( purchase ) && isDomainTransferCancelable;

		if ( ! isValidForCancellation && this.state.surveyShown ) {
			return true;
		}

		// Under the split flag, any purchase reached via ?intent=remove renders
		// the unified confirmation screen. Allow through regardless of
		// canAutoRenewBeTurnedOff so the page doesn't redirect away.
		if (
			! isValidForCancellation &&
			props.isSplitCancelRemoveEnabled &&
			props.intent === 'remove'
		) {
			return true;
		}

		return isValidForCancellation;
	};

	redirect = () => {
		const { purchase, siteSlug } = this.props;
		let redirectPath = this.props.purchaseListUrl ?? purchasesRoot;

		if (
			siteSlug &&
			purchase &&
			( ! canAutoRenewBeTurnedOff( purchase ) || isDomainTransfer( purchase ) )
		) {
			redirectPath = ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
				siteSlug,
				purchase.id
			);
		}

		page.redirect( redirectPath );
	};

	onCancelConfirmationStateChange = ( newState: Partial< CancelPurchaseState > ) => {
		this.setState( ( state ) => ( {
			...state,
			...newState,
		} ) );
	};

	onCancellationStart = ( intent?: 'refund' | 'autorenew' ) => {
		const { includedDomainPurchase, purchase, isJetpack, isAkismet, isDomainRegistrationPurchase } =
			this.props;

		// For Jetpack/Akismet products and domain registrations, call onCancellationComplete to show the dialog
		if ( isJetpack || isAkismet || isDomainRegistrationPurchase ) {
			this.onCancellationComplete();
			return;
		}

		if ( intent && this.state.cancelIntent !== intent ) {
			this.setState( { cancelIntent: intent } );
		}

		const shouldUseAutoRenewFlow = this.shouldUseAutoRenewFlow();
		const effectiveIntent = intent ?? this.state.cancelIntent;
		const shouldSkipDomainOptions = shouldUseAutoRenewFlow && effectiveIntent !== 'refund';

		// Only show domain options as a separate step if radio buttons will be displayed
		if (
			! shouldSkipDomainOptions &&
			includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase )
		) {
			this.setState( { showDomainOptionsStep: true } );
		} else if ( this.shouldFireMutationOnConfirm() ) {
			// Cancel-intent flag-on: fire the mutation first; surveyShown
			// flips to true inside fireMutationFromConfirm on success.
			this.fireMutationFromConfirm();
		} else {
			this.setState( { surveyShown: true } );
		}
	};

	onDomainOptionsComplete = ( domainOptions: {
		cancelBundledDomain: boolean;
		confirmCancelBundledDomain: boolean;
	} ) => {
		// Persist domain options first so fireMutationFromConfirm can read
		// cancelBundledDomain when constructing the cancelAndRefund payload.
		this.setState( {
			showDomainOptionsStep: false,
			cancelBundledDomain: domainOptions.cancelBundledDomain,
			confirmCancelBundledDomain: domainOptions.confirmCancelBundledDomain,
		} );
		if ( this.shouldFireMutationOnConfirm() ) {
			this.fireMutationFromConfirm();
		} else {
			this.setState( { surveyShown: true } );
		}
	};

	// Fire-on-confirm applies to the URL-intent Cancel path only — the user
	// clicked "Cancel" on Purchase Settings and we want their cancellation to
	// settle before the survey appears (so the heading reads "Cancellation
	// confirmed"). Remove (and the no-intent legacy deep link) defer the
	// mutation to onSurveyComplete, matching trunk's submit-handlers.
	shouldFireMutationOnConfirm = (): boolean =>
		this.props.isSplitCancelRemoveEnabled && this.props.intent === 'cancel';

	// Fire the cancel mutation when the user confirms, then advance to the
	// survey. The success notice is queued with displayOnNextPage so it shows
	// on the destination (manage-purchase) screen after the user submits or
	// skips the survey. refreshSitePlans / clearPurchases stay on the
	// survey-submit path — calling them now would flip
	// hasLoadedUserPurchasesFromServer and render the loading placeholder
	// over the survey.
	fireMutationFromConfirm = async () => {
		this.setState( { isLoading: true } );
		try {
			const flowType = this.getCancelFlowType( this.props.purchase );
			const isAutoRenewIntent = flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
			const result = isAutoRenewIntent
				? await this.cancelPurchase( this.props.purchase )
				: await this.cancelAndRefund( this.props.purchase );
			if ( result.success ) {
				const refundable = ! isAutoRenewIntent && hasAmountAvailableToRefund( this.props.purchase );
				if ( ! isAutoRenewIntent ) {
					await this.handleMarketplaceSubscriptions( refundable );
				}
				if ( refundable ) {
					this.props.successNotice( result.message, {
						displayOnNextPage: true,
						duration: 10000,
					} );
				}
				invokeSurvicateEvent( refundable ? 'purchaseRefunded' : 'purchaseCancelled' );
				this.setState( { surveyShown: true, isLoading: false, fireMutationWasRefund: refundable } );
			} else {
				this.props.errorNotice( result.error );
				this.setState( { isLoading: false } );
				// Stay on the confirmation page so the user can retry.
			}
		} catch ( error ) {
			this.props.errorNotice( ( error as Error ).message );
			this.setState( { isLoading: false } );
		}
	};

	cancelPurchase = async ( purchase: Purchases.Purchase ) => {
		const { translate, moment } = this.props;
		try {
			const success = await cancelPurchaseAsync( purchase.id );
			if ( success ) {
				const purchaseName = getName( purchase );
				const subscriptionEndDate = moment( purchase.expiryDate ).format( 'LL' );
				return {
					success: true,
					message: translate(
						'%(purchaseName)s was successfully cancelled. It will be available for use until it expires on %(subscriptionEndDate)s.',
						{
							args: { purchaseName, subscriptionEndDate },
						}
					),
				};
			}
			return {
				success: false,
				error: translate(
					'There was a problem canceling %(purchaseName)s. Please try again later or contact support.',
					{ args: { purchaseName: getName( purchase ) } }
				),
			};
		} catch ( error ) {
			return {
				success: false,
				error: translate(
					'There was a problem canceling %(purchaseName)s. Please try again later or contact support.',
					{ args: { purchaseName: getName( purchase ) } }
				),
			};
		}
	};

	cancelAndRefund = async ( purchase: Purchases.Purchase ) => {
		const { cancelBundledDomain } = this.state;
		try {
			await cancelAndRefundPurchaseAsync( purchase.id, {
				product_id: purchase.productId,
				cancel_bundled_domain: cancelBundledDomain ? 1 : 0,
				email_variant: config.isEnabled( 'purchases/split-cancel-remove' )
					? 'treatment'
					: 'control',
			} );
			return {
				success: true,
				message: this.props.translate(
					'Your refund has been processed and your purchase removed.'
				),
			};
		} catch ( error ) {
			return { success: false, error: ( error as Error ).message };
		}
	};

	removePurchase = async ( purchase: Purchases.Purchase ) => {
		const { translate } = this.props;
		try {
			await removePurchaseRequest( purchase.id );
			return {
				success: true,
				message: translate( '%(purchaseName)s was removed from your account.', {
					args: { purchaseName: getName( purchase ) },
				} ),
			};
		} catch ( error ) {
			return {
				success: false,
				error:
					( error as Error ).message ??
					translate(
						'There was a problem removing %(purchaseName)s. Please try again later or contact support.',
						{ args: { purchaseName: getName( purchase ) } }
					),
			};
		}
	};

	/**
	 * Returns true when the user clicked Remove on Purchase Settings AND the
	 * purchase is non-refundable. In that case the legacy flow should call
	 * DELETE rather than disable-auto-renew (the previous fallthrough). Gated
	 * by the split cancel/remove experiment because it changes
	 * user-visible post-action state (different endpoint, deleted row vs.
	 * expiring row).
	 *
	 * Refundable purchases continue to flow through `cancelAndRefund` so the
	 * user still receives their refund — `getMutationFlowType` returns
	 * `CANCEL_WITH_REFUND` in that case.
	 */
	isLegacyRemoveDeleteFlow = ( purchase: Purchases.Purchase ) => {
		if ( ! this.props.isSplitCancelRemoveEnabled ) {
			return false;
		}
		if ( this.props.intent !== 'remove' ) {
			return false;
		}
		if ( hasAmountAvailableToRefund( purchase ) ) {
			return false;
		}
		return getMutationFlowType( 'remove', purchase ) === CANCEL_FLOW_TYPE.REMOVE;
	};

	submitCancelAndRefundPurchase = async ( purchase: Purchases.Purchase ) => {
		if ( this.isLegacyRemoveDeleteFlow( purchase ) ) {
			return await this.removePurchase( purchase );
		}
		const refundable = hasAmountAvailableToRefund( purchase );
		if ( refundable ) {
			return await this.cancelAndRefund( purchase );
		}
		return await this.cancelPurchase( purchase );
	};

	handleMarketplaceSubscriptions = async ( isPlanRefundable: boolean ) => {
		const activeSubscriptions = this.getActiveMarketplaceSubscriptions();
		if ( activeSubscriptions?.length > 0 ) {
			return Promise.all(
				activeSubscriptions.map( async ( s ) => {
					if ( isPlanRefundable && hasAmountAvailableToRefund( s ) ) {
						await this.cancelAndRefund( s );
					} else {
						await this.cancelPurchase( s );
					}
				} )
			);
		}
	};

	onSurveyComplete = async () => {
		// Flag-on path: the mutation already fired at confirm-click via
		// fireMutationFromConfirm. fireMutationFromConfirm intentionally
		// skipped clearPurchases / refreshSitePlans so they wouldn't flip
		// isDataLoading mid-survey; we run them here, immediately before
		// the redirect, so the destination page picks up fresh server data.
		if ( this.shouldFireMutationOnConfirm() ) {
			this.props.refreshSitePlans( this.props.purchase.siteId );
			this.props.clearPurchases();
			const managePurchaseUrl = ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
				this.props.siteSlug,
				this.props.purchaseId
			);
			const backupRedirect = this.props.purchaseListUrl ?? purchasesRoot;
			const redirectUrl = managePurchaseUrl ?? backupRedirect;
			page.redirect(
				this.state.fireMutationWasRefund ? redirectUrl : redirectUrl + '?cancelled=true'
			);
			return;
		}

		// Set loading state to show busy button
		this.setState( { isLoading: true } );

		const isAutoRenewIntent = this.state.cancelIntent === 'autorenew';
		const isRemoveDeleteFlow = this.isLegacyRemoveDeleteFlow( this.props.purchase );

		// Optimistic path: strip cache → navigate → fire mutation in background
		if ( isRemoveDeleteFlow ) {
			// Capture props before the timeout — connect() + useSyncExternalStore
			// may update this.props synchronously when the Redux store changes.
			const { purchase, purchaseId, atomicTransfer, purchaseListUrl, translate } = this.props;
			const productNoun = getProductNounForCategory( classifyPurchaseForCopy( purchase ) );
			const isAtomic = Boolean( atomicTransfer?.created_at );
			const backupRedirect = purchaseListUrl ?? purchasesRoot;

			// Delay everything for tactile feedback (button stays busy for 1.5s)
			setTimeout( () => {
				// 1. Strip purchase from Redux store (preserves loaded flags — no refetch cascade).
				//    Capture the raw form so we can restore it if the mutation fails.
				const rawPurchase = this.props.removePurchaseFromState( purchaseId );

				// 2. Navigate with notice params (removedId enables the list to dismiss
				//    the success notice if the background mutation rolls back.)
				invokeSurvicateEvent( 'purchaseRemoved' );
				const params = new URLSearchParams();
				params.set( 'removed', productNoun );
				params.set( 'removedId', String( purchase.id ) );
				if ( isAtomic ) {
					params.set( 'removedDomain', purchase.domain );
				}
				page.redirect( `${ backupRedirect }?${ params.toString() }` );

				// 3. Fire mutation in background. On failure, restore the purchase to
				//    Redux — the list watches getUserPurchases for reappearance and
				//    self-dismisses its notice.
				removePurchaseRequest( purchase.id ).catch( () => {
					if ( rawPurchase ) {
						this.props.restorePurchaseToState( rawPurchase );
					}
					this.props.errorNotice(
						translate( 'There was a problem removing your purchase. Please try again.' )
					);
				} );
			}, 1500 );
			return;
		}

		try {
			const result = isAutoRenewIntent
				? await this.cancelPurchase( this.props.purchase )
				: await this.submitCancelAndRefundPurchase( this.props.purchase );
			if ( result.success ) {
				const refundable = isAutoRenewIntent
					? false
					: hasAmountAvailableToRefund( this.props.purchase );
				await this.handleMarketplaceSubscriptions( refundable );
				this.props.refreshSitePlans( this.props.purchase.siteId );
				this.props.clearPurchases();
				this.props.successNotice( result.message, {
					displayOnNextPage: true,
					duration: 10000,
				} );
				if ( refundable ) {
					invokeSurvicateEvent( 'purchaseRefunded' );
				} else {
					invokeSurvicateEvent( 'purchaseCancelled' );
				}
				const managePurchaseUrl = ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
					this.props.siteSlug,
					this.props.purchaseId
				);
				const backupRedirect = this.props.purchaseListUrl ?? purchasesRoot;
				const redirectUrl = managePurchaseUrl ?? backupRedirect;
				page.redirect( refundable ? redirectUrl : redirectUrl + '?cancelled=true' );
			} else {
				this.props.errorNotice( result.error );
			}
		} catch ( error ) {
			this.props.errorNotice( ( error as Error ).message );
		} finally {
			// Reset loading state
			this.setState( { surveyShown: false, isLoading: false, cancelIntent: null } );
		}
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
			isLoading: false,
			cancelIntent: null,
		} );
	};

	onSetLoading = ( isLoading: boolean ) => {
		this.setState( { isLoading } );
	};

	onCancellationComplete = () => {
		const { isJetpack, isAkismet, isDomainRegistrationPurchase } = this.props;

		// For Jetpack/Akismet products and domain registrations, show the button's own dialog
		// For all other products, show the main component's survey
		if ( isJetpack || isAkismet || isDomainRegistrationPurchase ) {
			this.setState( {
				showDialog: true,
				isLoading: false,
			} );
		} else {
			this.setState( {
				surveyShown: true,
				isLoading: false,
			} );
		}
	};

	downgradeClick = ( upsell: string ) => {
		const { purchase } = this.props;
		let downgradePlan = getDowngradePlanFromPurchase( purchase );
		if ( 'downgrade-monthly' === upsell ) {
			const monthlyProductSlug = getMonthlyPlanByYearly( purchase.productSlug );
			downgradePlan = getPlan( monthlyProductSlug );
		}

		this.setState( { isLoading: true } );
		if ( ! downgradePlan ) {
			throw new Error( 'Cannot find a plan to downgrade to' );
		}

		cancelAndRefundPurchase(
			purchase.id,
			{
				product_id: purchase.productId,
				type: 'downgrade',
				to_product_id: downgradePlan.getProductId(),
			},
			( error: Error, response: { message: string } ) => {
				this.setState( { isLoading: false } );

				if ( error ) {
					this.props.errorNotice( error.message );
					return;
				}

				this.props.refreshSitePlans( purchase.siteId );
				this.props.clearPurchases();
				this.props.successNotice( response.message, { displayOnNextPage: true } );
				page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
			}
		);
	};

	freeMonthOfferClick = async () => {
		const { purchase } = this.props;

		this.setState( { isLoading: true } );

		try {
			const res = await extendPurchaseWithFreeMonth( purchase.id );
			if ( res.status === 'completed' ) {
				this.props.refreshSitePlans( purchase.siteId );
				this.props.clearPurchases();
				this.props.successNotice( res.message, { displayOnNextPage: true } );
				page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
			}
		} catch ( err ) {
			this.props.errorNotice( ( err as Error ).message );
		} finally {
			this.setState( { isLoading: false } );
		}
	};

	onAtomicRevertConfirmationChange = ( isConfirmed: boolean ) => {
		this.setState( { atomicRevertConfirmed: isConfirmed } );
	};

	onDomainConfirmationChange = () => {
		const { purchase } = this.props;
		const newValue = ! this.state.domainConfirmationConfirmed;

		this.setState( { domainConfirmationConfirmed: newValue } );

		// Record tracks event for domain confirmation checkbox
		this.props.recordTracksEvent( 'calypso_purchases_domain_confirmation_checkbox', {
			product_slug: purchase.productSlug,
			purchase_id: purchase.id,
			checked: newValue,
		} );
	};

	onKeepSubscriptionClick = () => {
		const { purchase } = this.props;
		this.props.recordTracksEvent( 'calypso_purchases_keep_subscription', {
			product_slug: purchase.productSlug,
			purchase_id: purchase.id,
		} );
	};

	getActiveMarketplaceSubscriptions() {
		const { purchase, purchases, productsList } = this.props;

		if ( ! isPlan( purchase ) ) {
			return [];
		}

		return purchases.filter( ( _purchase ) =>
			hasMarketplaceProduct( productsList, _purchase.productSlug )
		);
	}

	renderRefundAmountString = (
		purchase: Purchases.Purchase,
		cancelBundledDomain: boolean,
		includedDomainPurchase: Purchases.Purchase
	) => {
		const { refundInteger, totalRefundInteger, totalRefundCurrency } = purchase;

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( cancelBundledDomain && includedDomainPurchase ) {
				return formatCurrency( totalRefundInteger, totalRefundCurrency, {
					isSmallestUnit: true,
				} );
			}
			return formatCurrency( refundInteger, totalRefundCurrency, {
				isSmallestUnit: true,
			} );
		}

		return null;
	};

	shouldUseAutoRenewFlow = () => {
		// The Cancel split-button always carries intent=cancel, which routes to
		// auto-renew cancellation (disable auto-renew, keep features until expiry).
		return this.props.intent === 'cancel';
	};

	getCancelFlowType = ( purchase: Purchases.Purchase ) => {
		const { intent } = this.props;

		// URL intent is authoritative when present: it was set at the Purchase
		// Settings button click.
		if ( intent === 'cancel' ) {
			return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
		}
		if ( intent === 'remove' ) {
			return hasAmountAvailableToRefund( purchase )
				? CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
				: CANCEL_FLOW_TYPE.REMOVE;
		}

		if ( ! this.shouldUseAutoRenewFlow() ) {
			return getPurchaseCancellationFlowType( purchase );
		}

		if ( this.state.cancelIntent === 'refund' ) {
			return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
		}

		if ( this.state.cancelIntent === 'autorenew' ) {
			return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
		}

		return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	};

	getCancelPurchaseButtonProps = () => {
		const {
			purchase,
			includedDomainPurchase,
			siteSlug,
			purchaseListUrl,
			isDomainRegistrationPurchase,
		} = this.props;

		// Check if we need atomic revert confirmation
		const needsAtomicRevertConfirmation =
			this.props.atomicTransfer?.created_at && ! isRefundable( purchase );

		const { isSplitCancelRemoveEnabled } = this.props;

		const isDisabled =
			( this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain ) ||
			( ! isSplitCancelRemoveEnabled &&
				needsAtomicRevertConfirmation &&
				! this.state.atomicRevertConfirmed &&
				isPlan( purchase ) ) ||
			( ! isSplitCancelRemoveEnabled &&
				isDomainRegistrationPurchase &&
				! this.state.domainConfirmationConfirmed ) ||
			( isSplitCancelRemoveEnabled &&
				! this.state.surveyShown &&
				! this.state.customerConfirmedUnderstanding );

		// cancelIntentOverride drives the CancelPurchaseButton's label + mutation
		// choice. URL intent is authoritative when present:
		// - intent=cancel  → autorenew (disable auto-renew)
		// - intent=remove  → refund (cancel-and-refund; for non-refundable falls
		//   through to REMOVE via the button's existing logic)
		let urlIntentOverride: 'refund' | 'autorenew' | undefined;
		if ( this.props.intent === 'cancel' ) {
			urlIntentOverride = 'autorenew';
		} else if ( this.props.intent === 'remove' ) {
			urlIntentOverride = 'refund';
		}

		return {
			purchase,
			includedDomainPurchase,
			disabled: isDisabled,
			siteSlug,
			cancelBundledDomain: this.state.cancelBundledDomain,
			purchaseListUrl: purchaseListUrl ?? purchasesRoot,
			displayVariant: this.props.intent === 'remove' ? ( 'remove' as const ) : undefined,
			cancelIntentOverride:
				urlIntentOverride ??
				( this.shouldUseAutoRenewFlow() ? ( 'autorenew' as const ) : undefined ),
			activeSubscriptions: this.getActiveMarketplaceSubscriptions(),
			onCancellationStart: this.onCancellationStart,
			onCancellationComplete: this.onCancellationComplete,
			onSurveyComplete: this.onSurveyComplete,
			moment: this.props.moment,
			// Cancellation state props
			showDialog: this.state.showDialog,
			isLoading: this.state.isLoading,
			onDialogClose: this.onDialogClose,
			onSetLoading: this.onSetLoading,
			downgradeClick: this.downgradeClick,
			freeMonthOfferClick: this.freeMonthOfferClick,
		};
	};

	renderCancelButton = () => {
		const cancelButtonProps = this.getCancelPurchaseButtonProps();

		return <CancelPurchaseButton { ...cancelButtonProps } />;
	};

	renderKeepSubscriptionButton = () => {
		const { purchase, siteSlug } = this.props;
		const label = getButtonLabels( {
			purchase: toPurchaseForCopy( purchase ),
			intent: this.props.intent === 'remove' ? 'remove' : 'cancel',
		} ).secondary;

		return (
			<Button
				borderless
				href={ ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
					siteSlug,
					this.props.purchaseId
				) }
				onClick={ this.onKeepSubscriptionClick }
			>
				{ label }
			</Button>
		);
	};

	renderMainContent = () => {
		const {
			purchase,
			includedDomainPurchase,
			atomicTransfer,
			isDomainRegistrationPurchase,
			intent,
			purchaseCancelFeatures,
			translate,
		} = this.props;
		const { isSplitCancelRemoveEnabled } = this.props;
		const cancellationFeatures = purchaseCancelFeatures?.features ?? [];

		const displayVariant: 'cancel' | 'remove' = intent === 'remove' ? 'remove' : 'cancel';
		const checkboxLabel = getCheckboxLabel();

		// Check if we should show domain options inline (when they don't need radio buttons)
		const shouldShowDomainOptionsInline =
			includedDomainPurchase &&
			! willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase );

		return (
			<>
				{ shouldShowDomainOptionsInline && (
					<CancelPurchaseDomainOptions
						includedDomainPurchase={ includedDomainPurchase }
						cancelBundledDomain={ false }
						purchase={ purchase }
						onCancelConfirmationStateChange={ this.onCancelConfirmationStateChange }
						isLoading={ false }
					/>
				) }

				{ includedDomainPurchase && atomicTransfer?.created_at && ! isRefundable( purchase ) && (
					<h2 className="formatted-header__title formatted-header__title--cancellation-flow">
						{ translate( 'What happens when you cancel' ) }
					</h2>
				) }

				<BackupRetentionOptionOnCancelPurchase purchase={ purchase } />

				<CancelPurchaseFeatureList
					purchase={ purchase }
					displayVariant={ displayVariant }
					cancellationFeatures={ cancellationFeatures }
				/>

				<AtomicRevertChanges
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					onConfirmationChange={ this.onAtomicRevertConfirmationChange }
					needsAtomicRevertConfirmation={ Boolean(
						! isSplitCancelRemoveEnabled &&
							isPlan( purchase ) &&
							atomicTransfer?.created_at &&
							! isRefundable( purchase )
					) }
					isLoading={ this.state.isLoading }
				/>

				<div className="cancel-purchase__support">
					<p className="cancel-purchase__support-heading">
						<strong>
							{ displayVariant === 'remove'
								? translate( 'Questions before you remove?' )
								: translate( 'Have a question before canceling?' ) }
						</strong>
					</p>
					<p className="cancel-purchase__support-text">
						{ translate( 'Our support team is here for you. {{a}}Contact us{{/a}}', {
							components: {
								a: isSplitCancelRemoveEnabled ? (
									<ContactSupportButton
										purchase={ {
											siteId: purchase.siteId,
											siteUrl: purchase.siteSlug ?? purchase.domain,
											productName: purchase.productName,
										} }
										displayVariant={ displayVariant }
									/>
								) : (
									<a
										href={ localizeUrl( 'https://wordpress.com/help/contact' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</p>
				</div>
				<hr className="cancel-purchase__divider" />

				{ ! this.state.surveyShown && (
					<div className="cancel-purchase__confirm-section">
						{ isDomainRegistrationPurchase && ! isSplitCancelRemoveEnabled && (
							<div className="cancel-purchase__domain-confirmation">
								<FormCheckbox
									checked={ this.state.domainConfirmationConfirmed }
									onChange={ this.onDomainConfirmationChange }
								/>
								<span>
									{ translate(
										'I understand that canceling means that I may {{strong}}lose this domain forever{{/strong}}.',
										{
											components: { strong: <strong /> },
										}
									) }
								</span>
							</div>
						) }
						{ isSplitCancelRemoveEnabled && (
							<label className="cancel-purchase__confirm-checkbox">
								<FormCheckbox
									checked={ this.state.customerConfirmedUnderstanding ?? false }
									disabled={ this.state.isLoading }
									onChange={ ( event: { target: { checked: boolean } } ) =>
										this.onCustomerConfirmedUnderstandingChange( event.target.checked )
									}
								/>
								<span>{ checkboxLabel }</span>
							</label>
						) }
					</div>
				) }

				<div className="cancel-purchase__confirm-buttons">
					{ this.renderCancelButton() }
					{ this.renderKeepSubscriptionButton() }
				</div>
			</>
		);
	};

	renderDomainOptionsContent = () => {
		const { includedDomainPurchase, purchase } = this.props;
		const { cancelBundledDomain, confirmCancelBundledDomain } = this.state;

		if ( ! includedDomainPurchase || ! isSubscription( purchase ) ) {
			return null;
		}

		const onCancelConfirmationStateChange = ( newState: Partial< CancelPurchaseState > ) => {
			this.setState( ( state ) => ( {
				...state,
				...newState,
			} ) );
		};

		const canContinue = () => {
			if ( ! cancelBundledDomain ) {
				return true;
			}
			return confirmCancelBundledDomain;
		};

		return (
			<>
				<CancelPurchaseDomainOptions
					includedDomainPurchase={ includedDomainPurchase }
					cancelBundledDomain={ cancelBundledDomain }
					purchase={ purchase }
					onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
					isLoading={ false }
				/>
				<div className="cancel-purchase__confirm-buttons">
					<CancelPurchaseButton
						purchase={ purchase }
						includedDomainPurchase={ includedDomainPurchase }
						disabled={ ! canContinue() }
						siteSlug={ this.props.siteSlug }
						cancelBundledDomain={ cancelBundledDomain }
						purchaseListUrl={ this.props.purchaseListUrl ?? purchasesRoot }
						cancelIntentOverride={
							this.state.cancelIntent !== null ? this.state.cancelIntent : undefined
						}
						activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
						onCancellationComplete={ this.onCancellationComplete }
						onSurveyComplete={ this.onSurveyComplete }
						moment={ this.props.moment }
						onCancellationStart={ null }
						// Cancellation state props
						showDialog={ this.state.showDialog }
						isLoading={ this.state.isLoading }
						onDialogClose={ this.onDialogClose }
						onSetLoading={ this.onSetLoading }
						downgradeClick={ this.downgradeClick }
						freeMonthOfferClick={ this.freeMonthOfferClick }
						// Disable marketplace dialog in domain options step to prevent double display
						showMarketplaceDialog={ false }
					/>
					{ this.renderKeepSubscriptionButton() }
				</div>
			</>
		);
	};

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		if ( isDataLoading( this.props ) || this.props.isPurchaseCancelFeaturesLoading ) {
			return (
				<div>
					<QueryUserPurchases />
					<CancelPurchaseLoadingPlaceholder />
				</div>
			);
		}

		if ( this.props.isHundredYearDomain ) {
			this.redirect();
			return null;
		}

		const { purchase, isJetpack, isAkismet, isDomainRegistrationPurchase, intent } = this.props;
		const { siteName, siteId } = purchase;

		const displayVariant: 'cancel' | 'remove' = intent === 'remove' ? 'remove' : 'cancel';
		// Once the cancel mutation has resolved and the user is on the survey,
		// the cancellation has already happened — reflect that in the heading.
		const heading =
			this.state.surveyShown && displayVariant === 'cancel'
				? this.props.translate( 'Cancellation confirmed' )
				: getCancellationHeading( {
						purchase: toPurchaseForCopy( purchase ),
						intent: displayVariant,
				  } );

		// When a plan has an included domain that can be cancelled together,
		// show the higher (full) refund amount in the notice since the user
		// can get this amount by choosing to cancel both.
		const includedDomainHasRadioButtons =
			this.props.includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( this.props.includedDomainPurchase, purchase );
		const refundAmountString = this.renderRefundAmountString(
			purchase,
			includedDomainHasRadioButtons || this.state.cancelBundledDomain,
			this.props.includedDomainPurchase
		);
		return (
			<>
				{ ! isJetpack && ! isAkismet && ! isDomainRegistrationPurchase && (
					<CancelPurchaseForm
						disableButtons={ this.state.isLoading }
						purchase={ purchase }
						isVisible={ this.state.surveyShown }
						onClose={ () => this.setState( { surveyShown: false } ) }
						onSurveyComplete={ this.onSurveyComplete }
						flowType={ this.getCancelFlowType( purchase ) }
						cancelBundledDomain={ this.state.cancelBundledDomain }
						includedDomainPurchase={ this.props.includedDomainPurchase }
						cancellationInProgress={ this.state.isLoading }
						downgradeClick={ this.downgradeClick }
						freeMonthOfferClick={ this.freeMonthOfferClick }
						intent={ this.props.intent }
					/>
				) }
				<Card className="cancel-purchase__wrapper-card">
					<QueryProductsList />
					<TrackPurchasePageView
						eventName="calypso_cancel_purchase_purchase_view"
						purchaseId={ this.props.purchaseId }
					/>

					<div className="cancel-purchase__back">
						<HeaderCakeBack
							icon="chevron-left"
							href={ ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
								this.props.siteSlug,
								this.props.purchaseId
							) }
						/>
					</div>

					<FormattedHeader
						className="cancel-purchase__formatted-header"
						brandFont
						headerText={ heading }
						align="left"
					/>

					{ ! this.state.showDomainOptionsStep && refundAmountString && intent === 'remove' && (
						<RefundEligibilityNotice
							refundAmount={ refundAmountString }
							mode="confirmed"
							purchase={ purchase }
						/>
					) }
					{ ! this.state.showDomainOptionsStep &&
						( ! refundAmountString || intent === 'cancel' ) && (
							<TimeRemainingNotice
								purchase={ purchase }
								displayVariant={ displayVariant }
								intent={ intent ?? null }
							/>
						) }

					<div className="cancel-purchase__inner-wrapper">
						<div className="cancel-purchase__left">
							{ this.state.showDomainOptionsStep
								? this.renderDomainOptionsContent()
								: this.renderMainContent() }
						</div>

						<div className="cancel-purchase__right">
							<div className="cancel-purchase__sticky-sidebar">
								<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
							</div>
						</div>
					</div>
				</Card>
			</>
		);
	}
}

const ConnectedCancelPurchase = connect(
	( state, props: CancelPurchaseProps ) => {
		const purchase = getByPurchaseId( state, props.purchaseId );
		const isJetpackPurchase =
			purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
		const purchases = purchase && getSitePurchases( state, purchase.siteId );
		const productsList = getProductsList( state );

		const domains = purchase && getDomainsBySiteId( state, purchase.siteId );
		const selectedDomainName = purchase && getName( purchase );
		const selectedDomain =
			domains && selectedDomainName && getSelectedDomain( { domains, selectedDomainName } );

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isJetpackPurchase,
			isJetpack: purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ),
			isAkismet: purchase && isAkismetProduct( purchase ),
			isDomainRegistrationPurchase: purchase && isDomainRegistration( purchase ),
			purchase,
			purchases,
			productsList,
			includedDomainPurchase: getIncludedDomainPurchase( state, purchase ),
			site: getSite( state, purchase ? purchase.siteId : null ),
			isHundredYearDomain: selectedDomain?.isHundredYearDomain,
			atomicTransfer: getAtomicTransfer( state, purchase?.siteId ),
		};
	},
	{
		recordTracksEvent,
		clearPurchases,
		refreshSitePlans,
		removePurchaseFromState,
		restorePurchaseToState,
		successNotice,
		errorNotice,
	}
)( localize( withLocalizedMoment( CancelPurchase ) ) );

function CancelPurchaseWithExperiment( props: CancelPurchaseProps ) {
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	return (
		<ConnectedCancelPurchase
			{ ...props }
			isSplitCancelRemoveEnabled={ isSplitCancelRemoveEnabled }
		/>
	);
}

export default CancelPurchaseWithExperiment;
