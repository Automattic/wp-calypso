import { __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import {
	isAkismetProduct,
	isGSuiteOrGoogleWorkspaceProductSlug,
	getPurchaseCancellationFlowType,
	CANCEL_FLOW_TYPE,
} from '../../../utils/purchase';
import BackupRetentionOptionOnCancelPurchase from './backup-retention-management/retention-option-on-cancel-purchase';
import CancelPurchaseDomainOptions from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import GSuiteAccessMessage from './gsuite-access-message';
import PlanProductRevertContent from './plan-product-revert-content';
import CancelPurchaseRefundInformation from './refund-information';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	Domain,
	AtomicTransfer,
	UpgradesCancelFeaturesResponse,
} from '@automattic/api-core';

interface CancellationMainContentProps {
	purchase: Purchase;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	selectedDomain?: Domain;
	state: CancelPurchaseState;
	purchaseCancelFeatures?: UpgradesCancelFeaturesResponse;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onKeepSubscriptionClick: () => void;
	onCancelClick?: () => void;
}

// Helper function to determine if radio buttons will be shown
const willShowDomainOptionsRadioButtons = (
	includedDomainPurchase: Purchase,
	purchase: Purchase
) => {
	return (
		includedDomainPurchase.is_domain_registration &&
		purchase.is_refundable &&
		includedDomainPurchase.is_refundable
	);
};

export default function CancellationMainContent( {
	purchase,
	includedDomainPurchase,
	atomicTransfer,
	selectedDomain,
	state,
	purchaseCancelFeatures,
	onCancelConfirmationStateChange,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onKeepSubscriptionClick,
	onCancelClick,
}: CancellationMainContentProps ) {
	const isJetpack = purchase.is_jetpack_plan_or_product;
	const isAkismet = isAkismetProduct( purchase );
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isGSuite = isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug );

	const atomicRevertChanges = [
		{
			getSlug: () => 'primarySite',
			getTitle: () => __( 'Set your site to private.' ),
		},
		{
			getSlug: () => 'primaryDomain',
			getTitle: () =>
				/* translators: %(domainName)s is a domain name */
				sprintf( __( 'Use %(domainName)s as your primary domain' ), {
					domainName: purchase.domain,
				} ),
		},
		{
			getSlug: () => 'removeThemesPluginsData',
			getTitle: () => __( 'Remove your installed themes, plugins, and their data.' ),
		},
		{
			getSlug: () => 'revertThemesAndSettings',
			getTitle: () => __( 'Switch to the settings and theme you had before you upgraded.' ),
		},
	];

	const defaultChanges = [];
	if (
		! isJetpack &&
		! isAkismet &&
		! isDomainRegistrationPurchase &&
		purchase.is_plan &&
		Boolean( atomicTransfer?.created_at )
	) {
		defaultChanges.push( ...atomicRevertChanges );
	}

	// Get features from the API endpoint for this product
	const cancellationFeatures = purchaseCancelFeatures?.features ?? [];

	let showDefaultChanges = false;
	if ( ! isJetpack && ! isAkismet && ! isGSuite && ! isDomainRegistrationPurchase ) {
		showDefaultChanges = true;
	}

	const cancellationChanges = showDefaultChanges ? defaultChanges : [];

	// Check if we should show domain options inline (when they don't need radio buttons)
	const shouldShowDomainOptionsInline =
		includedDomainPurchase &&
		! willShowDomainOptionsRadioButtons( includedDomainPurchase, purchase );

	return (
		<VStack spacing={ 6 }>
			{ shouldShowDomainOptionsInline && (
				<CancelPurchaseDomainOptions
					includedDomainPurchase={ includedDomainPurchase }
					cancelBundledDomain={ false }
					purchase={ purchase }
					onCancelConfirmationStateChange={ onCancelConfirmationStateChange }
					isLoading={ false }
				/>
			) }

			{ includedDomainPurchase && atomicTransfer?.created_at && ! purchase.is_refundable && (
				<h2 className="formatted-header__title formatted-header__title--cancellation-flow">
					{ __( 'What happens when you cancel' ) }
				</h2>
			) }

			<BackupRetentionOptionOnCancelPurchase siteId={ purchase.blog_id } purchase={ purchase } />

			{ isGSuite && (
				<GSuiteAccessMessage purchase={ purchase } selectedDomain={ selectedDomain } />
			) }

			<CancelPurchaseFeatureList
				purchase={ purchase }
				cancellationFeatures={ cancellationFeatures }
				cancellationChanges={ cancellationChanges }
			/>

			{ getPurchaseCancellationFlowType( purchase ) !== CANCEL_FLOW_TYPE.REMOVE && (
				<CancelPurchaseRefundInformation
					purchase={ purchase }
					isJetpackPurchase={ isJetpack }
					selectedDomain={ selectedDomain }
				/>
			) }

			<PlanProductRevertContent
				purchase={ purchase }
				includedDomainPurchase={ includedDomainPurchase }
				atomicTransfer={ atomicTransfer }
				state={ state }
				onDomainConfirmationChange={ onDomainConfirmationChange }
				onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
				onKeepSubscriptionClick={ onKeepSubscriptionClick }
				onCancelClick={ onCancelClick }
			/>
		</VStack>
	);
}
