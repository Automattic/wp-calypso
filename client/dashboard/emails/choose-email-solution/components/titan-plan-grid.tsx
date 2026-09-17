import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addMailboxRoute } from '../../../app/router/emails';
import { PriceDisplay } from '../../../components/price-display';
import { Text } from '../../../components/text';
import { useEmailProduct } from '../../hooks/use-email-product';
import poweredByTitanLogo from '../../resources/powered-by-titan-caps.svg';
import { IntervalLength, MailboxProvider, TitanPlanTier } from '../../types';
import { getTrialMonths } from '../../utils/get-trial-months';
import { isEligibleForIntroductoryOffer } from '../../utils/is-eligible-for-introductory-offer';
import {
	getTitanDowngradeTargetId,
	getTitanTierName,
	isLowerTitanTier,
} from '../../utils/titan-tiers';
import type { Domain, EmailSubscription, Product } from '@automattic/api-core';

interface TitanPlan {
	tier: TitanPlanTier;
	product?: Product;
	hasFreeTrial: boolean;
	trialMonths: number;
	isPopular: boolean;
	everythingInName?: string;
}

// Descriptions remain placeholder copy; feature lists reflect the tier
// comparison from DOTEMP-111.
const getTierDetails = ( tier: TitanPlanTier ): { description: string; features: string[] } => {
	switch ( tier ) {
		case TitanPlanTier.Pro:
			return {
				description: __( 'Everything you need to get started with professional, secure email.' ),
				features: [
					__( '30 GB / mailbox' ),
					__( '10 read receipts' ),
					__( '1 email template' ),
					__( '1 contact group' ),
					__( 'Blocklist' ),
					__( 'Allowlist' ),
					__( 'Grammar & spell check' ),
					__( 'Undo send' ),
				],
			};
		case TitanPlanTier.Premium:
			return {
				description: __(
					'Smarter tools to help your growing business stay organized and productive.'
				),
				features: [
					__( '50 GB / mailbox' ),
					__( 'Unlimited read receipts' ),
					__( 'Unlimited email templates' ),
					__( 'Unlimited contact groups' ),
					__( 'Two-factor authentication' ),
					__( 'Priority inbox' ),
					__( 'Business auto reply' ),
					__( 'Titan Task' ),
					__( 'Titan Drive (1 GB storage)' ),
					__( 'Email labels' ),
					__( 'Auto-clean' ),
					__( 'Send later' ),
					__( 'Follow-up reminders' ),
					__( 'Turbo search' ),
					__( 'Send as alias' ),
					__( 'Undo send' ),
					__( 'Branding' ),
					__( 'Team chat' ),
				],
			};
		case TitanPlanTier.Ultra:
			return {
				description: __( 'AI-powered email to scale your business and boost marketing impact.' ),
				features: [
					__( '100 GB / mailbox' ),
					__( 'Email backup (50 GB storage)' ),
					__( 'File transfer' ),
					__( 'Titan AI (compose, reply)' ),
					__( 'AI summary' ),
					__( 'Titan Booking' ),
					__( 'Titan Drive (50 GB storage)' ),
					__( 'Signature designer' ),
					__( 'File and link tracking' ),
					__( 'Email designer' ),
					__( 'Email campaigns' ),
					__( 'Invoice builder' ),
				],
			};
	}
};

export function TitanPlanGrid( {
	domain,
	domainName,
	interval,
	available,
	currentTier,
	subscriptionInterval,
	canDowngrade = false,
	isDowngradePending = false,
	pendingDowngradeTier,
	busyDowngradeTier,
	onUpgrade,
	onDowngrade,
	onCancelScheduledDowngrade,
}: {
	domain?: Domain;
	domainName: string;
	interval: IntervalLength;
	available: boolean;
	// The tier the user is currently subscribed to. When set, the grid is in
	// plan-change mode: the current tier is labeled, higher tiers offer an
	// upgrade, and lower tiers offer a downgrade.
	currentTier?: TitanPlanTier;
	// Billing term of the current subscription. A downgrade keeps that term, so
	// lower tiers are only actionable while the selected interval matches it.
	subscriptionInterval?: IntervalLength;
	// False when no live subscription backs the grid, which leaves lower tiers
	// disabled instead of offering an action that would fail.
	canDowngrade?: boolean;
	// Whether a downgrade is already scheduled.
	isDowngradePending?: boolean;
	// Tier that downgrade targets, when it maps to a known tier. Only labels
	// which card offers to cancel it.
	pendingDowngradeTier?: TitanPlanTier;
	// Tier whose downgrade action is in flight.
	busyDowngradeTier?: TitanPlanTier;
	// Upgrades are purchases, so this routes to checkout.
	onUpgrade?: ( tier: TitanPlanTier ) => void;
	// Downgrades are a direct API call, so this never goes to checkout.
	onDowngrade?: ( tier: TitanPlanTier, toProductId: number ) => void;
	onCancelScheduledDowngrade?: () => void;
} ) {
	const navigate = useNavigate();

	const { product: proProduct } = useEmailProduct(
		MailboxProvider.Titan,
		interval,
		domain,
		TitanPlanTier.Pro
	);
	const { product: premiumProduct } = useEmailProduct(
		MailboxProvider.Titan,
		interval,
		domain,
		TitanPlanTier.Premium
	);
	const { product: ultraProduct } = useEmailProduct(
		MailboxProvider.Titan,
		interval,
		domain,
		TitanPlanTier.Ultra
	);

	const emailSubscription = domain?.titan_mail_subscription as EmailSubscription | undefined;
	const hasFreeTrial = ( product?: Product ) =>
		isEligibleForIntroductoryOffer( { emailSubscription, product } );

	const plans: TitanPlan[] = [
		{
			tier: TitanPlanTier.Pro,
			product: proProduct,
			hasFreeTrial: hasFreeTrial( proProduct ),
			trialMonths: getTrialMonths( proProduct ),
			isPopular: false,
		},
		{
			tier: TitanPlanTier.Premium,
			product: premiumProduct,
			hasFreeTrial: hasFreeTrial( premiumProduct ),
			trialMonths: getTrialMonths( premiumProduct ),
			isPopular: true,
			everythingInName: getTitanTierName( TitanPlanTier.Pro ),
		},
		{
			tier: TitanPlanTier.Ultra,
			product: ultraProduct,
			hasFreeTrial: hasFreeTrial( ultraProduct ),
			trialMonths: getTrialMonths( ultraProduct ),
			isPopular: false,
			everythingInName: getTitanTierName( TitanPlanTier.Premium ),
		},
	];

	// All tiers stay visible when changing plan; lower tiers offer a downgrade.
	const isLowerTier = ( tier: TitanPlanTier ) => isLowerTitanTier( tier, currentTier );

	const productForTier = ( tier: TitanPlanTier ) =>
		plans.find( ( plan ) => plan.tier === tier )?.product;

	// The interval selector is still available to monthly subscribers so they can
	// upgrade onto annual billing. Downgrades cannot change term, so they are
	// offered only while the selected interval matches the subscription's.
	const isSubscriptionInterval = ! subscriptionInterval || interval === subscriptionInterval;

	const getDowngradeTargetId = ( tier: TitanPlanTier ) =>
		isSubscriptionInterval
			? getTitanDowngradeTargetId( {
					currentTier,
					currentProduct: currentTier ? productForTier( currentTier ) : undefined,
					targetTier: tier,
					targetProduct: productForTier( tier ),
					interval,
			  } )
			: undefined;

	// The tier that gets the emphasized (primary) button: the recommended plan when
	// buying, or the recommended upgrade target when upgrading. The current and lower
	// tiers are never emphasized because upgrading is the encouraged action.
	const primaryTier = ( () => {
		const candidates = currentTier
			? plans.filter( ( plan ) => plan.tier !== currentTier && ! isLowerTier( plan.tier ) )
			: plans;
		return ( candidates.find( ( plan ) => plan.isPopular ) ?? candidates[ 0 ] )?.tier;
	} )();

	const getMonthlyPrice = ( product?: Product ) => {
		if ( ! product?.cost ) {
			return 0;
		}

		const baseCost = product.sale_cost ?? product.cost;
		return interval === IntervalLength.Annually ? baseCost / 12 : baseCost;
	};

	return (
		<div className="email-providers">
			{ plans.map( ( plan ) => {
				const planName = getTitanTierName( plan.tier );
				const details = getTierDetails( plan.tier );
				const isCurrentPlan = plan.tier === currentTier;
				const isDowngrade = isLowerTier( plan.tier );
				const downgradeTargetId = getDowngradeTargetId( plan.tier );
				const isPendingDowngrade = Boolean(
					pendingDowngradeTier && plan.tier === pendingDowngradeTier
				);
				// Scheduling a second downgrade would replace the first.
				const isBlockedByPendingDowngrade =
					isDowngradePending && isDowngrade && ! isPendingDowngrade;
				const isBlockedByInterval = isDowngrade && ! isSubscriptionInterval;
				const isDowngradeAvailable =
					isDowngrade && canDowngrade && Boolean( downgradeTargetId ) && ! isDowngradePending;

				let actionLabel;
				if ( isCurrentPlan ) {
					actionLabel = __( 'Current plan' );
				} else if ( isPendingDowngrade ) {
					actionLabel = __( 'Cancel scheduled change' );
				} else if ( isDowngrade ) {
					actionLabel = __( 'Downgrade' );
				} else if ( currentTier ) {
					actionLabel = __( 'Upgrade' );
				} else if ( plan.hasFreeTrial ) {
					actionLabel = __( 'Start trial' );
				} else {
					actionLabel = sprintf(
						/* translators: %s is the email plan name. */
						__( 'Get %s' ),
						planName
					);
				}

				const isActionDisabled =
					! available ||
					isCurrentPlan ||
					( isDowngrade && ! isPendingDowngrade && ! isDowngradeAvailable );

				return (
					<VStack
						className="email-provider email-titan-plan"
						key={ `titan-plan-${ plan.tier }` }
						spacing={ 4 }
					>
						<VStack spacing={ 2 }>
							<Text
								as="h2"
								size={ 28 }
								lineHeight="36px"
								className="email-provider-name email-titan-plan-name"
							>
								{ planName }
							</Text>
							<Text className="email-titan-plan-description">{ details.description }</Text>
						</VStack>
						<VStack spacing={ 2 } justify="flex-start" className="email-titan-plan-pricing">
							<HStack
								alignment="topLeft"
								spacing={ 1 }
								expanded={ false }
								className="email-titan-plan-price"
							>
								<PriceDisplay
									price={ plan.hasFreeTrial ? 0 : getMonthlyPrice( plan.product ) }
									currency={ plan.product?.currency_code ?? 'USD' }
								/>
								{ plan.hasFreeTrial && (
									<PriceDisplay
										price={ getMonthlyPrice( plan.product ) }
										currency={ plan.product?.currency_code ?? 'USD' }
										discounted
									/>
								) }
								<Text variant="muted" size={ 16 } lineHeight="24px">
									{ __( '/month' ) }
								</Text>
							</HStack>
							<Text variant="muted">
								{ interval === IntervalLength.Annually
									? __( 'per month, per mailbox, billed every 12 months.' )
									: __( 'per month, per mailbox, billed monthly.' ) }
							</Text>
							{ plan.hasFreeTrial && (
								<div className="email-provider-trial">
									{ sprintf(
										/* translators: %d is the number of free trial months. */
										__( '%d month free trial' ),
										plan.trialMonths
									) }
								</div>
							) }
							{ ! available && (
								<Text variant="muted">{ __( 'Not available for this domain name.' ) }</Text>
							) }
						</VStack>
						<Button
							__next40pxDefaultSize
							className="email-provider-action"
							variant={ plan.tier === primaryTier ? 'primary' : 'secondary' }
							disabled={ isActionDisabled || Boolean( busyDowngradeTier ) }
							isBusy={ busyDowngradeTier === plan.tier }
							onClick={ () => {
								if ( isPendingDowngrade ) {
									onCancelScheduledDowngrade?.();
									return;
								}
								// Downgrades call the API directly; only upgrades go to checkout.
								if ( isDowngradeAvailable && downgradeTargetId ) {
									onDowngrade?.( plan.tier, downgradeTargetId );
									return;
								}
								if ( currentTier ) {
									onUpgrade?.( plan.tier );
									return;
								}
								navigate( {
									to: addMailboxRoute.to,
									params: {
										domain: domainName,
										provider: MailboxProvider.Titan,
										interval,
									},
									search: { tier: plan.tier },
								} );
							} }
						>
							{ actionLabel }
						</Button>
						{ isBlockedByPendingDowngrade && (
							<Text variant="muted" className="email-titan-plan-downgrade-note">
								{ __( 'Cancel your scheduled plan change to pick a different plan.' ) }
							</Text>
						) }
						{ isBlockedByInterval && (
							<Text variant="muted" className="email-titan-plan-downgrade-note">
								{ __( 'Switch back to your current billing period to downgrade.' ) }
							</Text>
						) }
						<VStack spacing={ 1 }>
							<Text weight={ 600 } className="email-titan-plan-everything-in">
								{ plan.everythingInName &&
									sprintf(
										/* translators: %s is the name of the previous, cheaper email plan. */
										__( 'Everything in %s' ),
										plan.everythingInName
									) }
							</Text>
							<ul className="email-provider-features">
								{ details.features.map( ( feature, featureIndex ) => (
									<li key={ `feature-${ plan.tier }-${ featureIndex }` }>{ feature }</li>
								) ) }
							</ul>
						</VStack>
						<img
							className="email-provider-powered-by"
							src={ poweredByTitanLogo }
							alt={ __( 'Powered by Titan' ) }
						/>
					</VStack>
				);
			} ) }
		</div>
	);
}
