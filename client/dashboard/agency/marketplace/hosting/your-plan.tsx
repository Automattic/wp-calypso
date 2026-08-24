import {
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import { getTieredPrice, formatUSD, wpcomHosting } from './mock-data';
import type { PressablePlan } from './mock-data';

type YourPlanProps = {
	brand: 'wpcom' | 'pressable';
	term: 'monthly' | 'yearly';
	quantity: number;
	plan?: PressablePlan;
	onAddToCart: () => void;
};

export default function YourPlan( { brand, term, quantity, plan, onAddToCart }: YourPlanProps ) {
	const price = brand === 'wpcom' ? getTieredPrice( wpcomHosting, quantity, term ) : null;

	const planLabel =
		brand === 'wpcom'
			? sprintf(
					/* translators: %d: number of sites */
					_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
					quantity
			  )
			: sprintf(
					/* translators: %s: plan name */
					__( 'Pressable %s' ),
					plan?.name ?? ''
			  );

	const total = brand === 'wpcom' ? price?.discountedCost ?? null : plan?.yearly_price ?? null;

	const ctaLabel =
		brand === 'wpcom'
			? sprintf(
					/* translators: %d: number of sites */
					_n( 'Add %d site to cart', 'Add %d sites to cart', quantity ),
					quantity
			  )
			: sprintf(
					/* translators: %s: plan name */
					__( 'Add %s to cart' ),
					plan?.name ?? ''
			  );

	return (
		<Card className="marketplace-hosting__summary">
			<CardBody>
				<VStack spacing={ 3 }>
					<Heading level={ 3 } size={ 16 }>
						{ __( 'Your plan' ) }
					</Heading>
					<Text>{ planLabel }</Text>
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
								{ term === 'yearly' ? __( '· billed yearly' ) : __( '· billed monthly' ) }
							</Text>
						) }
						{ brand === 'pressable' && total === null && (
							<Text variant="muted">{ __( 'Prototype: price loads from the products API.' ) }</Text>
						) }
					</VStack>
					<VStack spacing={ 2 } alignment="flex-start">
						<Button variant="primary" __next40pxDefaultSize onClick={ onAddToCart }>
							{ ctaLabel }
						</Button>
						<Text variant="muted">{ __( 'Cancel anytime.' ) }</Text>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
