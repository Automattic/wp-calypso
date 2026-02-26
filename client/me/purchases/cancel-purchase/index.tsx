import config from '@automattic/calypso-config';
import {
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	isWpComPlan,
	hasMarketplaceProduct,
	isJetpackPlan,
	isJetpackProduct,
	isAkismetProduct,
	getPlan,
	getMonthlyPlanByYearly,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, CompactCard } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import BackupRetentionOptionOnCancelPurchase from 'calypso/components/backup-retention-management/retention-option-on-cancel-purchase';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getName,
	purchaseType,
	hasAmountAvailableToRefund,
	canAutoRenewBeTurnedOff,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'calypso/lib/purchases';
import {
	cancelPurchaseAsync,
	cancelAndRefundPurchaseAsync,
	cancelAndRefundPurchase,
	extendPurchaseWithFreeMonth,
} from 'calypso/lib/purchases/actions';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import CancelPurchaseLoadingPlaceholder from 'calypso/me/purchases/cancel-purchase/loading-placeholder';
import { managePurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import ProductLink from 'calypso/me/purchases/product-link';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { clearPurchases } from 'calypso/state/purchases/actions';
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
import SupportLink from '../cancel-purchase-support-link/support-link';
import AtomicRevertChanges from './atomic-revert-changes';
import CancelPurchaseButton from './button';
import CancelPurchaseDomainOptions, { willShowDomainOptionsRadioButtons } from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import RefundEligibilityNotice from './refund-eligibility-notice';
import CancelPurchaseRefundInformation from './refund-information';
import type { Purchases, SiteDetails } from '@automattic/data-stores';
import type { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import type { ReactNode } from 'react';

import './style.scss';

interface MomentProps {
	moment: typeof moment;
}

export interface CancelPurchaseState {
	cancelBundledDomain: boolean;
	confirmCancelBundledDomain: boolean;
	surveyShown: boolean;
	atomicRevertConfirmed: boolean;
	isLoading: boolean;
	domainConfirmationConfirmed: boolean;
	showDomainOptionsStep: boolean;
	showDialog: boolean;
	cancelIntent: 'refund' | 'autorenew' | null;
}

export interface CancelPurchaseActions {
	recordTracksEvent: (
		name: string,
		properties: { [ key: string ]: string | boolean | number }
	) => void;
	clearPurchases: () => void;
	refreshSitePlans: ( siteId: string | number ) => void;
	successNotice: (
		message: string | ReactNode,
		properties: { displayOnNextPage?: boolean; duration?: number }
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
	productsList: Record< string, { product_type: string; billing_product_slug: string } >;
	purchase: Purchases.Purchase;
	purchases: Purchases.Purchase[];
	site: SiteDetails;
}

export interface CancelPurchaseProps {
	getManagePurchaseUrlFor?: GetManagePurchaseUrlFor;
	purchaseId: number;
	purchaseListUrl?: string;
	siteSlug: string;
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
		isLoading: false,
		domainConfirmationConfirmed: false,
		showDomainOptionsStep: false,
		// Cancellation state moved from button component
		showDialog: false,
		cancelIntent: null,
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

		const shouldUseAutoRenewFlow = this.shouldUseAutoRenewFlow( purchase );
		const effectiveIntent = intent ?? this.state.cancelIntent;
		const shouldSkipDomainOptions = shouldUseAutoRenewFlow && effectiveIntent !== 'refund';

		// Only show domain options as a separate step if radio buttons will be displayed
		if (
			! shouldSkipDomainOptions &&
			includedDomainPurchase &&
			willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase )
		) {
			this.setState( { showDomainOptionsStep: true } );
		} else {
			// For direct cancellations (no domain options step), show survey directly
			this.setState( { surveyShown: true } );
		}
	};

	onDomainOptionsComplete = ( domainOptions: {
		cancelBundledDomain: boolean;
		confirmCancelBundledDomain: boolean;
	} ) => {
		this.setState( {
			showDomainOptionsStep: false,
			surveyShown: true,
			cancelBundledDomain: domainOptions.cancelBundledDomain,
			confirmCancelBundledDomain: domainOptions.confirmCancelBundledDomain,
		} );
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

	submitCancelAndRefundPurchase = async ( purchase: Purchases.Purchase ) => {
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
		// Set loading state to show busy button
		this.setState( { isLoading: true } );

		try {
			const isAutoRenewIntent = this.state.cancelIntent === 'autorenew';
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
				this.props.successNotice( result.message, { displayOnNextPage: true, duration: 10000 } );
				const managePurchaseUrl = ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
					this.props.siteSlug,
					this.props.purchaseId
				);
				const backupRedirect = this.props.purchaseListUrl ?? purchasesRoot;
				page.redirect( managePurchaseUrl ?? backupRedirect );
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

	renderExpirationText = () => {
		const { purchase, translate } = this.props;
		const { expiryDate } = purchase;

		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			// Domain in AGP bought with domain credits
			if ( isRefundable( purchase ) ) {
				return translate(
					'After you confirm this change, the domain will be removed immediately.'
				);
			}
			return translate(
				'After you confirm this change, the domain will be removed on %(expirationDate)s.',
				{
					args: { expirationDate },
				}
			);
		}

		return translate(
			'After you confirm this change, the subscription will be removed on %(expirationDate)s.',
			{
				args: { expirationDate },
			}
		);
	};

	renderFullText = () => {
		const { includedDomainPurchase, purchase, translate } = this.props;
		const { expiryDate } = purchase;
		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			includedDomainPurchase
		);
		const shouldDisplayRefundNotice =
			Boolean( refundAmountString ) && this.shouldUseAutoRenewFlow( purchase );

		if ( refundAmountString && ! shouldDisplayRefundNotice ) {
			return translate(
				'If you confirm this cancellation, you will receive a {{span}}refund of %(refundText)s{{/span}}, and your subscription will be removed immediately.',
				{
					args: {
						refundText: refundAmountString,
					},
					context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
					components: {
						span: <span className="cancel-purchase__refund-string" />,
					},
				}
			);
		}

		return translate(
			'If you complete this cancellation, your subscription will be removed on {{span}}%(expirationDate)s{{/span}}.',
			{
				args: {
					expirationDate,
				},
				components: {
					span: <span className="cancel-purchase__warning-string" />,
				},
			}
		);
	};

	renderFooterText = () => {
		const { purchase, translate } = this.props;

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			this.props.includedDomainPurchase
		);

		if ( refundAmountString ) {
			return translate( '%(refundText)s to be refunded', {
				args: {
					refundText: refundAmountString,
				},
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}
	};

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

	shouldUseAutoRenewFlow = ( purchase: Purchases.Purchase ) => {
		return Boolean(
			config.isEnabled( 'calypso/refund-eligibility-notice' ) &&
				hasAmountAvailableToRefund( purchase ) &&
				isPlan( purchase ) &&
				isWpComPlan( purchase?.productSlug )
		);
	};

	getCancelFlowType = ( purchase: Purchases.Purchase ) => {
		if ( ! this.shouldUseAutoRenewFlow( purchase ) ) {
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

		const isDisabled =
			( this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain ) ||
			( needsAtomicRevertConfirmation &&
				! this.state.atomicRevertConfirmed &&
				isPlan( purchase ) ) ||
			( isDomainRegistrationPurchase && ! this.state.domainConfirmationConfirmed );

		return {
			purchase,
			includedDomainPurchase,
			disabled: isDisabled,
			siteSlug,
			cancelBundledDomain: this.state.cancelBundledDomain,
			purchaseListUrl: purchaseListUrl ?? purchasesRoot,
			cancelIntentOverride: this.shouldUseAutoRenewFlow( purchase )
				? ( 'autorenew' as const )
				: undefined,
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
		const { siteSlug, translate } = this.props;

		return (
			<FormButton
				isPrimary={ false }
				href={ ( this.props.getManagePurchaseUrlFor ?? managePurchase )(
					siteSlug,
					this.props.purchaseId
				) }
				onClick={ this.onKeepSubscriptionClick }
			>
				{ translate( 'Keep subscription' ) }
			</FormButton>
		);
	};

	renderMainContent = ( options?: { useRefundableWpcomCopy?: boolean } ) => {
		const { purchase, isJetpackPurchase, includedDomainPurchase, atomicTransfer } = this.props;
		const plan = getPlan( purchase?.productSlug );

		const cancellationFeatures =
			plan && 'getCancellationFeatures' in plan ? plan.getCancellationFeatures?.() ?? [] : [];

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
						{ this.props.translate( 'What happens when you cancel' ) }
					</h2>
				) }

				<BackupRetentionOptionOnCancelPurchase purchase={ purchase } />

				<CancelPurchaseRefundInformation
					purchase={ purchase }
					isJetpackPurchase={ isJetpackPurchase }
					useAutoRenewFlow={ this.shouldUseAutoRenewFlow( purchase ) }
				/>

				<CancelPurchaseFeatureList
					purchase={ purchase }
					cancellationFeatures={ cancellationFeatures }
					useRefundableWpcomCopy={ options?.useRefundableWpcomCopy }
				/>

				{ cancellationFeatures.length
					? this.renderPlanRevertContent()
					: this.renderProductRevertContent() }
			</>
		);
	};

	renderProductRevertContent = () => {
		const { purchase, isDomainRegistrationPurchase, atomicTransfer } = this.props;
		const purchaseName = getName( purchase );
		const plan = getPlan( purchase?.productSlug );
		const planDescription = plan?.getPlanCancellationDescription?.();

		return (
			<>
				<CompactCard className="cancel-purchase__product-information">
					<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
					<div className="cancel-purchase__description">{ purchaseType( purchase ) }</div>
					{ planDescription && (
						<div className="cancel-purchase__plan-description">{ planDescription }</div>
					) }
					<ProductLink purchase={ purchase } selectedSite={ this.props.site } />

					{ isPlan( purchase ) && (
						<AtomicRevertChanges
							atomicTransfer={ atomicTransfer }
							purchase={ purchase }
							onConfirmationChange={ this.onAtomicRevertConfirmationChange }
							needsAtomicRevertConfirmation={ Boolean(
								atomicTransfer?.created_at && ! isRefundable( purchase )
							) }
							isLoading={ this.state.isLoading }
						/>
					) }
				</CompactCard>

				<CompactCard className="cancel-purchase__footer">
					{ isDomainRegistrationPurchase && (
						<div className="cancel-purchase__domain-confirmation">
							<FormCheckbox
								checked={ this.state.domainConfirmationConfirmed }
								onChange={ this.onDomainConfirmationChange }
							/>
							<span>
								{ this.props.translate(
									'I understand that canceling means that I may {{strong}}lose this domain forever{{/strong}}.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</span>
						</div>
					) }
					<div className="cancel-purchase__footer-text-wrapper">
						<div className="cancel-purchase__footer-text">
							{ hasAmountAvailableToRefund( purchase ) ? (
								<p className="cancel-purchase__refund-amount">{ this.renderFooterText() }</p>
							) : (
								<p className="cancel-purchase__expiration-text">{ this.renderExpirationText() }</p>
							) }
						</div>
						{ this.renderCancelButton() }
					</div>
				</CompactCard>
			</>
		);
	};

	renderPlanRevertContent = () => {
		const { purchase, atomicTransfer, includedDomainPurchase } = this.props;

		return (
			<>
				<AtomicRevertChanges
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					onConfirmationChange={ this.onAtomicRevertConfirmationChange }
					needsAtomicRevertConfirmation={ Boolean(
						atomicTransfer?.created_at && ! isRefundable( purchase )
					) }
					isLoading={ this.state.isLoading }
				/>

				{ ! includedDomainPurchase && <p>{ this.renderFullText() }</p> }

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

		if ( isDataLoading( this.props ) ) {
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

		const { purchase, isJetpack, isAkismet, isDomainRegistrationPurchase } = this.props;
		const purchaseName = getName( purchase );
		const { siteName, siteId } = purchase;

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.props.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName },
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.props.translate( 'Cancel your %(purchaseName)s subscription', {
				args: { purchaseName },
			} );
		}

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
		const shouldShowRefundEligibilityNotice =
			Boolean( refundAmountString ) && this.shouldUseAutoRenewFlow( purchase );

		const cancelButtonProps = this.getCancelPurchaseButtonProps();

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

					{ shouldShowRefundEligibilityNotice &&
						refundAmountString &&
						! this.state.showDomainOptionsStep && (
							<RefundEligibilityNotice
								refundAmount={ refundAmountString }
								cancelButtonProps={ cancelButtonProps }
							/>
						) }

					<div className="cancel-purchase__inner-wrapper">
						<div className="cancel-purchase__left">
							{ this.state.showDomainOptionsStep
								? this.renderDomainOptionsContent()
								: this.renderMainContent( {
										useRefundableWpcomCopy: shouldShowRefundEligibilityNotice,
								  } ) }
						</div>

						<div className="cancel-purchase__right">
							<div className="cancel-purchase__sticky-sidebar">
								<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
								<SupportLink usage="cancel-purchase" purchase={ purchase } />
							</div>
						</div>
					</div>
				</Card>
			</>
		);
	}
}

export default connect(
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
	{ recordTracksEvent, clearPurchases, refreshSitePlans, successNotice, errorNotice }
)( localize( withLocalizedMoment( CancelPurchase ) ) );
