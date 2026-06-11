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

// Placeholder descriptions and feature lists, final copy pending (DOTEMP-111).
const TIER_DETAILS: Record< TitanPlanTier, { description: string; features: string[] } > = {
	[ TitanPlanTier.Pro ]: {
		description: 'Everything you need to get started with professional, secure email.',
		features: [
			'30 GB storage',
			'Rich email',
			'Native mobile apps',
			'Integrated calendar',
			'Integrated contacts',
			'Guaranteed email delivery',
			'Advanced anti-spam',
			'Advanced anti-virus',
		],
	},
	[ TitanPlanTier.Premium ]: {
		description: 'Smarter tools to help your growing business stay organized and productive.',
		features: [
			'50 GB storage',
			'Unlimited read receipts',
			'Unlimited email templates',
			'Unlimited contact groups',
			'Follow up reminders',
			'Send later',
			'Grammar & spell check',
			'Priority inbox',
		],
	},
	[ TitanPlanTier.Ultra ]: {
		description: 'AI-powered email to scale your business and boost marketing impact.',
		features: [
			'100 GB storage',
			'AI email writer',
			'Appointment booking',
			'Email campaigns',
			'Attachment and link tracking',
			'Email designer',
			'Signature designer',
		],
	},
};

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

export function TitanPlanGrid( {
	domain,
	domainName,
	interval,
	available,
	hasProFreeTrial,
	proTrialMonths,
}: {
	domain?: Domain;
	domainName: string;
	interval: IntervalLength;
	available: boolean;
	hasProFreeTrial: boolean;
	proTrialMonths: number;
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

	const getMonthlyPrice = ( product?: Product ) => {
		if ( ! product?.cost ) {
			return 0;
		}

		return interval === IntervalLength.Annually ? product.cost / 12 : product.cost;
	};

	return (
		<div className="email-providers">
			{ plans.map( ( plan ) => {
				const planName = getTierName( plan.tier );
				const details = TIER_DETAILS[ plan.tier ];

				return (
					<VStack
						className="email-provider email-titan-plan"
						key={ `titan-plan-${ plan.tier }` }
						spacing={ 4 }
					>
						<Text
							as="h2"
							size={ 28 }
							lineHeight="36px"
							className="email-provider-name email-titan-plan-name"
						>
							{ planName }
						</Text>
						<Text className="email-titan-plan-description">{ details.description }</Text>
						<VStack spacing={ 2 } justify="flex-start" className="email-titan-plan-price">
							<HStack alignment="bottomLeft">
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
							disabled={ ! available }
							onClick={ () =>
								navigate( {
									to: addMailboxRoute.to,
									params: {
										domain: domainName,
										provider: MailboxProvider.Titan,
										interval,
									},
									search: { tier: plan.tier },
								} )
							}
						>
							{ plan.hasFreeTrial
								? __( 'Start trial' )
								: sprintf(
										/* translators: %s is the email plan name. */
										__( 'Get %s' ),
										planName
								  ) }
						</Button>
						<VStack spacing={ 1 }>
							{ plan.everythingInName && (
								<Text weight={ 600 }>
									{ sprintf(
										/* translators: %s is the name of the previous, cheaper email plan. */
										__( 'Everything in %s' ),
										plan.everythingInName
									) }
								</Text>
							) }
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
