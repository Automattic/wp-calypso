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
import type { Domain, Product } from '@automattic/api-core';

interface TitanPlan {
	tier: TitanPlanTier;
	product?: Product;
	hasFreeTrial: boolean;
	isPopular: boolean;
	everythingInName?: string;
}

const getTierName = ( tier: TitanPlanTier ): string => {
	switch ( tier ) {
		case TitanPlanTier.Pro:
			return __( 'Pro' );
		case TitanPlanTier.Premium:
			return __( 'Premium' );
		case TitanPlanTier.Ultra:
			return __( 'Ultra' );
	}
};

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

// Tiers ordered from lowest to highest, used to hide tiers below the current one
// when upgrading.
const TIER_ORDER: TitanPlanTier[] = [
	TitanPlanTier.Pro,
	TitanPlanTier.Premium,
	TitanPlanTier.Ultra,
];

export function TitanPlanGrid( {
	domain,
	domainName,
	interval,
	available,
	hasProFreeTrial,
	proTrialMonths,
	currentTier,
	onUpgrade,
}: {
	domain?: Domain;
	domainName: string;
	interval: IntervalLength;
	available: boolean;
	hasProFreeTrial: boolean;
	proTrialMonths: number;
	// The tier the user is currently subscribed to. When set, the grid is in
	// upgrade mode: lower tiers are hidden, the current tier is labeled, and higher
	// tiers offer an upgrade.
	currentTier?: TitanPlanTier;
	// Called when a higher tier is selected in upgrade mode (currentTier set).
	onUpgrade?: ( tier: TitanPlanTier ) => void;
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

	const plans: TitanPlan[] = [
		{
			tier: TitanPlanTier.Pro,
			product: proProduct,
			hasFreeTrial: hasProFreeTrial,
			isPopular: false,
		},
		{
			tier: TitanPlanTier.Premium,
			product: premiumProduct,
			hasFreeTrial: false,
			isPopular: true,
			everythingInName: getTierName( TitanPlanTier.Pro ),
		},
		{
			tier: TitanPlanTier.Ultra,
			product: ultraProduct,
			hasFreeTrial: false,
			isPopular: false,
			everythingInName: getTierName( TitanPlanTier.Premium ),
		},
	];

	// When upgrading, only offer the current plan (labeled below) and higher tiers,
	// since this flow cannot downgrade.
	const visiblePlans = currentTier
		? plans.filter(
				( plan ) => TIER_ORDER.indexOf( plan.tier ) >= TIER_ORDER.indexOf( currentTier )
		  )
		: plans;

	const getMonthlyPrice = ( product?: Product ) => {
		if ( ! product?.cost ) {
			return 0;
		}

		const baseCost = product.sale_cost ?? product.cost;
		return interval === IntervalLength.Annually ? baseCost / 12 : baseCost;
	};

	return (
		<div className="email-providers">
			{ visiblePlans.map( ( plan ) => {
				const planName = getTierName( plan.tier );
				const details = getTierDetails( plan.tier );
				const isCurrentPlan = plan.tier === currentTier;

				let actionLabel;
				if ( isCurrentPlan ) {
					actionLabel = __( 'Current plan' );
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
										proTrialMonths
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
							variant={ plan.isPopular ? 'primary' : 'secondary' }
							disabled={ ! available || isCurrentPlan }
							onClick={ () => {
								// Upgrade mode goes to checkout for the picked tier; otherwise the
								// grid is buying a new plan, so collect mailboxes first.
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
