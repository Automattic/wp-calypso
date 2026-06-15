import { __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import {
	isAkismetProduct,
	isGSuiteOrGoogleWorkspaceProductSlug,
	DisplayVariant,
} from '../../../utils/purchase';
import BackupRetentionOptionOnCancelPurchase from './backup-retention-management/retention-option-on-cancel-purchase';
import CancelPurchaseDomainOptions from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import GSuiteAccessMessage from './gsuite-access-message';
import PlanProductRevertContent from './plan-product-revert-content';
import { useIsSplitCancelRemoveEnabled } from './use-is-split-cancel-remove-enabled';
import type { CancelPurchaseState } from './types';
import type {
	Purchase,
	Domain,
	AtomicTransfer,
	Site,
	UpgradesCancelFeaturesResponse,
} from '@automattic/api-core';

interface CancellationMainContentProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	includedDomainPurchase?: Purchase;
	atomicTransfer?: AtomicTransfer;
	selectedDomain?: Domain;
	site?: Site;
	wpcomDomain?: string | null;
	activeMarketplaceSubscriptions?: Purchase[];
	state: CancelPurchaseState;
	purchaseCancelFeatures?: UpgradesCancelFeaturesResponse;
	isBusy?: boolean;
	onCancelConfirmationStateChange: ( newState: Partial< CancelPurchaseState > ) => void;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
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
		!! includedDomainPurchase.cost_to_unbundle_display &&
		includedDomainPurchase.is_within_initial_refund_window
	);
};

export default function CancellationMainContent( {
	purchase,
	displayVariant,
	includedDomainPurchase,
	atomicTransfer,
	selectedDomain,
	site,
	wpcomDomain,
	activeMarketplaceSubscriptions,
	state,
	purchaseCancelFeatures,
	isBusy,
	onCancelConfirmationStateChange,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
	onKeepSubscriptionClick,
	onCancelClick,
}: CancellationMainContentProps ) {
	const isJetpack = purchase.is_jetpack_plan_or_product;
	const isAkismet = isAkismetProduct( purchase );
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isGSuite = isGSuiteOrGoogleWorkspaceProductSlug( purchase.product_slug );
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();

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

	if ( isSplitCancelRemoveEnabled ) {
		// Non-primary domain forwarding: plan cancellation on a site with a custom primary domain.
		if ( purchase.is_plan && site?.URL && wpcomDomain ) {
			const primaryDomain = new URL( site.URL ).hostname;
			if ( primaryDomain !== wpcomDomain ) {
				defaultChanges.push(
					{
						getSlug: () => 'domainForwarding',
						getTitle: () =>
							sprintf(
								/* translators: %(primaryDomain)s is the custom domain, %(wpcomDomain)s is the WordPress.com subdomain */
								__( '%(primaryDomain)s will start forwarding to %(wpcomDomain)s.' ),
								{ primaryDomain, wpcomDomain }
							),
					},
					{
						getSlug: () => 'domainVisible',
						getTitle: () =>
							sprintf(
								/* translators: %(wpcomDomain)s is the WordPress.com subdomain */
								__(
									'%(wpcomDomain)s will become the address people see when they visit your site.'
								),
								{ wpcomDomain }
							),
					}
				);
			}
		}

		// WordAds ineligibility: plan cancellation on a site enrolled in WordAds.
		if ( purchase.is_plan && site?.options?.wordads ) {
			defaultChanges.push( {
				getSlug: () => 'wordAdsIneligible',
				getTitle: () => __( 'You will become ineligible for the WordAds program.' ),
			} );
		}

		// Marketplace subscription cascade: plan cancellation with active marketplace subscriptions.
		if ( activeMarketplaceSubscriptions && activeMarketplaceSubscriptions.length > 0 ) {
			for ( const sub of activeMarketplaceSubscriptions ) {
				defaultChanges.push( {
					getSlug: () => `marketplace-${ sub.ID }`,
					getTitle: () =>
						sprintf(
							/* translators: %(productName)s is the name of a marketplace subscription */
							__( '%(productName)s will also be removed.' ),
							{ productName: sub.product_name }
						),
				} );
			}
		}

		// Domain deletion consequences: removing a domain registration.
		if ( isDomainRegistrationPurchase ) {
			defaultChanges.push(
				{
					getSlug: () => 'domainServicesUnreachable',
					getTitle: () =>
						sprintf(
							/* translators: %(domain)s is the domain name being deleted */
							__(
								'All services connected to %(domain)s will become unreachable, including email and website.'
							),
							{ domain: purchase.meta ?? '' }
						),
				},
				{
					getSlug: () => 'domainAvailable',
					getTitle: () =>
						sprintf(
							/* translators: %(domain)s is the domain name being deleted */
							__( '%(domain)s will become available for someone else to register.' ),
							{ domain: purchase.meta ?? '' }
						),
				}
			);

			if ( selectedDomain?.is_gravatar_restricted_domain ) {
				defaultChanges.push( {
					getSlug: () => 'gravatarDomain',
					getTitle: () =>
						__(
							'This domain is provided at no cost for your Gravatar profile. If you delete it, you will have to pay full price for another.'
						),
				} );
			}
		}
	}

	// Get features from the API endpoint for this product
	const cancellationFeatures = purchaseCancelFeatures?.features ?? [];

	let showDefaultChanges = false;
	if ( ! isJetpack && ! isAkismet && ! isGSuite && ! isDomainRegistrationPurchase ) {
		showDefaultChanges = true;
	}
	// Under the flag, domain registrations also have warning bullets in defaultChanges.
	if ( isSplitCancelRemoveEnabled && isDomainRegistrationPurchase ) {
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

			{ isGSuite && ! isSplitCancelRemoveEnabled && (
				<GSuiteAccessMessage purchase={ purchase } selectedDomain={ selectedDomain } />
			) }

			<CancelPurchaseFeatureList
				purchase={ purchase }
				displayVariant={ displayVariant }
				cancellationFeatures={ cancellationFeatures }
				cancellationChanges={ cancellationChanges }
			/>

			<PlanProductRevertContent
				purchase={ purchase }
				displayVariant={ displayVariant }
				includedDomainPurchase={ includedDomainPurchase }
				atomicTransfer={ atomicTransfer }
				state={ state }
				isBusy={ isBusy }
				onDomainConfirmationChange={ onDomainConfirmationChange }
				onCustomerConfirmedUnderstandingChange={ onCustomerConfirmedUnderstandingChange }
				onCustomerConfirmedUnderstandingAtomicPlanRevert={
					onCustomerConfirmedUnderstandingAtomicPlanRevert
				}
				onKeepSubscriptionClick={ onKeepSubscriptionClick }
				onCancelClick={ onCancelClick }
			/>
		</VStack>
	);
}
