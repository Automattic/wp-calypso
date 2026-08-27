import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { getTieredPrice, formatUSD, wpcomHosting } from './mock-data';
import type { HostingProduct, PressablePlan } from './mock-data';

type YourPlanProps = {
	brand: 'wpcom' | 'pressable';
	term: 'monthly' | 'yearly';
	quantity: number;
	plan?: PressablePlan;
	product?: HostingProduct;
	ownedSites?: number;
	currentPlan?: PressablePlan;
	isReferralMode?: boolean;
	onAddToCart: () => void;
};

export default function YourPlan( {
	brand,
	term,
	quantity,
	plan,
	product = wpcomHosting,
	ownedSites = 0,
	currentPlan,
	isReferralMode = false,
	onAddToCart,
}: YourPlanProps ) {
	const price = brand === 'wpcom' ? getTieredPrice( product, quantity, term, ownedSites ) : null;
	const isContactSales = brand === 'pressable' && ! plan;
	const isUpgrade = brand === 'pressable' && !! currentPlan && ! isContactSales;
	const isCurrentPlan = isUpgrade && plan?.slug === currentPlan?.slug;

	let planLabel;
	if ( brand !== 'wpcom' ) {
		planLabel = sprintf(
			/* translators: %s: plan name */
			__( 'Pressable %s' ),
			plan?.name ?? __( 'Custom' )
		);
	} else if ( ownedSites > 0 ) {
		planLabel = sprintf(
			/* translators: %d: number of new sites */
			_n( '%d new WordPress.com site', '%d new WordPress.com sites', quantity ),
			quantity
		);
	} else {
		planLabel = sprintf(
			/* translators: %d: number of sites */
			_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
			quantity
		);
	}

	const total =
		brand === 'wpcom'
			? price?.discountedCost ?? null
			: ( term === 'yearly' ? plan?.yearly_price : plan?.monthly_price ) ?? null;

	let ctaLabel;
	if ( isReferralMode ) {
		ctaLabel =
			brand === 'wpcom'
				? __( 'Add to referral' )
				: sprintf(
						/* translators: %s: plan name */
						__( 'Add %s to referral' ),
						plan?.name ?? ''
				  );
	} else if ( brand === 'wpcom' ) {
		ctaLabel = sprintf(
			/* translators: %d: number of sites */
			_n( 'Add %d site to cart', 'Add %d sites to cart', quantity ),
			quantity
		);
	} else if ( isCurrentPlan ) {
		ctaLabel = __( 'Your current plan' );
	} else if ( isUpgrade ) {
		ctaLabel = sprintf(
			/* translators: %s: plan name */
			__( 'Upgrade to %s' ),
			plan?.name ?? ''
		);
	} else {
		ctaLabel = sprintf(
			/* translators: %s: plan name */
			__( 'Add %s to cart' ),
			plan?.name ?? ''
		);
	}

	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'Your plan' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 3 } justify="flex-start">
					<Text>{ planLabel }</Text>
					{ isContactSales && (
						<>
							<VStack spacing={ 1 }>
								<Text size={ 18 } weight={ 600 }>
									{ __( 'Custom pricing' ) }
								</Text>
							</VStack>
							<VStack spacing={ 4 } alignment="flex-start">
								<Button
									variant="primary"
									__next40pxDefaultSize
									href="https://pressable.com/contact/"
									target="_blank"
									rel="noreferrer"
								>
									{ __( 'Contact us ↗' ) }
								</Button>
							</VStack>
							<CardDivider />
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ check } className="marketplace-hosting__check" />
								<Text variant="muted">
									{ sprintf(
										/* translators: %s: commission percentage, e.g. 20% */
										__( 'Get %s commission when you refer.' ),
										'20%'
									) }
								</Text>
							</HStack>
						</>
					) }
					{ ! isContactSales && (
						<VStack spacing={ 1 }>
							<Text className="marketplace-hosting__plan-price">
								{ total !== null ? formatUSD( total ) : '—' }
								<Text as="span" variant="muted">
									{ term === 'yearly' ? __( '/year' ) : __( '/month' ) }
								</Text>
							</Text>
							{ brand === 'wpcom' && price && price.discountPercent > 0 && (
								<Text variant="muted">
									<span className="marketplace-hosting__price-strikethrough">
										{ formatUSD( price.actualCost ) }
									</span>
									{ ' · ' }
									{ sprintf(
										/* translators: %s: amount saved */
										__( 'Save %s' ),
										formatUSD( price.actualCost - price.discountedCost )
									) }
									{ ' · ' }
									{ term === 'yearly' ? __( 'billed yearly' ) : __( 'billed monthly' ) }
								</Text>
							) }
							{ brand === 'wpcom' && price && ownedSites > 0 && (
								<Text variant="muted">
									{ sprintf(
										/* translators: %1$d: discount percentage, %2$d: total sites, %3$d: owned sites, %4$d: new sites */
										__( '%1$d%% off at %2$d total sites. Your %3$d existing sites count.' ),
										Math.round( price.discountPercent * 100 ),
										ownedSites + quantity,
										ownedSites
									) }
								</Text>
							) }
							{ isUpgrade && ! isCurrentPlan && currentPlan && (
								<Text variant="muted">
									{ sprintf(
										/* translators: %s: current plan name */
										__( 'Replaces your current %s plan.' ),
										currentPlan.name
									) }
								</Text>
							) }
							{ brand === 'pressable' && total === null && (
								<Text variant="muted">
									{ __( 'Prototype: price loads from the products API.' ) }
								</Text>
							) }
						</VStack>
					) }
					{ ! isContactSales && (
						<>
							<VStack spacing={ 4 } alignment="flex-start">
								<Button
									variant="primary"
									__next40pxDefaultSize
									disabled={ isCurrentPlan }
									onClick={ onAddToCart }
								>
									{ ctaLabel }
								</Button>
							</VStack>
							<CardDivider />
							<HStack spacing={ 2 } justify="flex-start" alignment="center">
								<Icon icon={ check } className="marketplace-hosting__check" />
								<Text variant="muted">
									{ isReferralMode
										? __( 'You earn commission when your client pays.' )
										: __( 'Cancel anytime.' ) }
								</Text>
							</HStack>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
