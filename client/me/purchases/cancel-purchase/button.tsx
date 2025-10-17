import {
	isDomainRegistration,
	isJetpackPlan,
	isJetpackProduct,
	isAkismetProduct,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import DomainCancellationSurvey from 'calypso/components/marketing-survey/cancel-purchase-form/domain-cancellation-survey';
import {
	getName,
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	isSubscription,
} from 'calypso/lib/purchases';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { MarketPlaceSubscriptionsDialog } from '../marketplace-subscriptions-dialog';
import { willShowDomainOptionsRadioButtons } from './domain-options';
import type { Purchases } from '@automattic/data-stores';
import type { LocalizeProps } from 'i18n-calypso';

interface MomentProps {
	moment: typeof moment;
}

export interface CancelPurchaseButtonConnectedProps {
	isJetpack: boolean;
	isAkismet: boolean;
}

export interface CancelPurchaseButtonProps {
	purchase: Purchases.Purchase;
	purchaseListUrl?: string;
	siteSlug: string;
	cancelBundledDomain: boolean;
	includedDomainPurchase: Purchases.Purchase;
	disabled?: boolean;
	activeSubscriptions: Array< { id: number; productName: string } >;
	onCancellationStart: null | ( () => void );
	onCancellationComplete: () => void;
	onSurveyComplete: () => void;
	// Props from parent component
	showDialog: boolean;
	isLoading: boolean;
	onDialogClose: () => void;
	onSetLoading: ( isLoading: boolean ) => void;
	// Methods from parent component
	downgradeClick: ( upsell: string ) => void;
	freeMonthOfferClick: () => void;
	// Control marketplace dialog visibility
	showMarketplaceDialog?: boolean;
}

export type CancelPurchaseButtonAllProps = CancelPurchaseButtonProps &
	CancelPurchaseButtonConnectedProps &
	LocalizeProps &
	MomentProps;

export interface CancelPurchaseButtonState {
	disabled: boolean;
	isShowingMarketplaceSubscriptionsDialog: boolean;
}

class CancelPurchaseButton extends Component<
	CancelPurchaseButtonAllProps,
	CancelPurchaseButtonState
> {
	state = {
		disabled: false,
		isShowingMarketplaceSubscriptionsDialog: false,
	};

	setDisabled = ( disabled: boolean ) => {
		this.setState( { disabled } );
	};

	handleCancelPurchaseClick = async () => {
		// For all purchases, including domain registrations, show the survey first
		// The API call will happen at the end of the survey flow

		// For other purchases, determine if we need domain options step
		// If onCancellationStart is null, we're already in the domain options step
		if ( this.props.onCancellationStart === null ) {
			// We're in the domain options step, show survey directly
			this.props.onCancellationComplete();
		} else {
			const needsDomainOptionsStep =
				this.props.includedDomainPurchase &&
				willShowDomainOptionsRadioButtons( this.props.includedDomainPurchase, this.props.purchase );

			if ( needsDomainOptionsStep ) {
				// Step 1: Show domain options step
				this.props.onCancellationStart();
			} else {
				// Step 2: Show survey directly (API call will happen in survey)
				this.props.onCancellationStart();
			}
		}
	};

	closeDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: false,
		} );

		// Call parent's dialog close handler if provided
		if ( this.props.onDialogClose ) {
			this.props.onDialogClose();
		}

		// Always redirect to purchases page when dialog is closed
		page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
	};

	shouldHandleMarketplaceSubscriptions() {
		const { activeSubscriptions, showMarketplaceDialog } = this.props;

		return activeSubscriptions?.length > 0 && ( showMarketplaceDialog ?? true );
	}

	showMarketplaceDialog = () => {
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: true,
		} );
	};

	handleMarketplaceDialogContinue = () => {
		// Close the marketplace dialog
		this.setState( {
			isShowingMarketplaceSubscriptionsDialog: false,
		} );

		// Show the appropriate survey based on purchase type
		this.handleCancelPurchaseClick();
	};

	handleSurveyComplete = () => {
		// Call the parent's survey complete handler
		if ( this.props.onSurveyComplete ) {
			this.props.onSurveyComplete();
		}
	};

	render() {
		const { purchase, translate, cancelBundledDomain, includedDomainPurchase } = this.props;

		const onClick = ( () => {
			return this.handleCancelPurchaseClick;
		} )();

		const needsDomainOptionsStep =
			this.props.includedDomainPurchase &&
			! willShowDomainOptionsRadioButtons( this.props.includedDomainPurchase, this.props.purchase );
		const text = ( () => {
			if ( includedDomainPurchase && needsDomainOptionsStep ) {
				return translate( 'Continue with cancellation' );
			}

			if ( hasAmountAvailableToRefund( purchase ) ) {
				if ( isDomainRegistration( purchase ) ) {
					return translate( 'Cancel domain and refund' );
				}
				if ( isSubscription( purchase ) ) {
					return translate( 'Cancel subscription' );
				}
				if ( isOneTimePurchase( purchase ) ) {
					return translate( 'Cancel and refund' );
				}
			}

			if ( isDomainRegistration( purchase ) ) {
				return translate( 'Cancel domain' );
			}

			if ( isSubscription( purchase ) ) {
				return translate( 'Cancel subscription' );
			}
		} )();

		const disableButtons = this.state.disabled || this.props.disabled;
		const { isJetpack, isAkismet, purchaseListUrl, activeSubscriptions, isLoading, showDialog } =
			this.props;

		const planName = getName( purchase );

		return (
			<div className="cancel-purchase__button-wrapper">
				<Button
					className="cancel-purchase__button"
					disabled={ disableButtons }
					busy={ isLoading }
					scary
					onClick={
						this.shouldHandleMarketplaceSubscriptions() ? this.showMarketplaceDialog : onClick
					}
					primary
				>
					{ text }
				</Button>

				{ ! isJetpack && ! isAkismet && ! isDomainRegistration( purchase ) && (
					<CancelPurchaseForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.handleSurveyComplete }
						downgradeClick={ this.props.downgradeClick }
						freeMonthOfferClick={ this.props.freeMonthOfferClick }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						cancelBundledDomain={ cancelBundledDomain }
						includedDomainPurchase={ includedDomainPurchase }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ ( isJetpack || isAkismet ) && (
					<CancelJetpackForm
						disableButtons={ disableButtons }
						purchase={ purchase }
						purchaseListUrl={ purchaseListUrl ?? purchasesRoot }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.props.onSurveyComplete }
						flowType={ getPurchaseCancellationFlowType( purchase ) }
						isAkismet={ isAkismet }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ isDomainRegistration( purchase ) && (
					<DomainCancellationSurvey
						disableButtons={ disableButtons }
						purchase={ purchase }
						purchaseListUrl={ purchaseListUrl ?? purchasesRoot }
						isVisible={ showDialog }
						onClose={ this.closeDialog }
						onSurveyComplete={ this.props.onSurveyComplete }
						cancellationInProgress={ isLoading }
					/>
				) }

				{ this.shouldHandleMarketplaceSubscriptions() && (
					<MarketPlaceSubscriptionsDialog
						isDialogVisible={ this.state.isShowingMarketplaceSubscriptionsDialog }
						closeDialog={ this.closeDialog }
						removePlan={ this.handleMarketplaceDialogContinue }
						planName={ planName }
						activeSubscriptions={ activeSubscriptions }
						sectionHeadingText={ translate( 'Cancel %(plan)s', {
							args: { plan: planName },
						} ) }
						primaryButtonText={ translate( 'Continue', {
							comment:
								'This button cancels the active plan and all active Marketplace subscriptions on the site',
						} ) }
						bodyParagraphText={ translate(
							'This subscription will be cancelled. It will be removed when it expires.',
							'These subscriptions will be cancelled. They will be removed when they expire.',
							{ count: activeSubscriptions.length }
						) }
					/>
				) }
			</div>
		);
	}
}

export default connect(
	( state, { purchase }: CancelPurchaseButtonProps ) => ( {
		isJetpack: purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ),
		isAkismet: purchase && isAkismetProduct( purchase ),
	} ),
	{
		clearPurchases,
		errorNotice,
		successNotice,
		refreshSitePlans,
	}
)( localize( CancelPurchaseButton ) );
