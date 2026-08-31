import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { Card, CardBody, CardDivider } from '../../../components/card';
import { getTieredPrice, formatUSD, wpcomHosting } from './mock-data';
import { getPressablePlanDisplayName } from './pressable-plan-display-names';
import type { PressablePlan } from './mock-data';

type OrderSummaryProps = {
	brand: 'wpcom' | 'pressable';
	term: 'monthly' | 'yearly';
	quantity: number;
	plan?: PressablePlan;
	onCheckout: () => void;
};

export default function OrderSummary( {
	brand,
	term,
	quantity,
	plan,
	onCheckout,
}: OrderSummaryProps ) {
	const price = brand === 'wpcom' ? getTieredPrice( wpcomHosting, quantity, term ) : null;
	const hasDiscount = !! price && price.discountPercent > 0;

	return (
		<Card className="marketplace-hosting__summary">
			<CardBody>
				<VStack spacing={ 4 }>
					<Heading level={ 3 } size={ 16 }>
						{ __( 'Summary' ) }
					</Heading>

					{ brand === 'wpcom' && price && (
						<VStack spacing={ 2 }>
							<HStack justify="space-between">
								<Text>
									{ sprintf(
										/* translators: %d: number of sites */
										_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
										quantity
									) }
								</Text>
								<Text>{ formatUSD( price.actualCost ) }</Text>
							</HStack>
							{ hasDiscount && (
								<HStack justify="space-between">
									<Text variant="muted">
										{ sprintf(
											/* translators: %d: discount percentage */
											__( 'Volume discount (%d%%)' ),
											Math.round( price.discountPercent * 100 )
										) }
									</Text>
									<Text variant="muted">
										{ `−${ formatUSD( price.actualCost - price.discountedCost ) }` }
									</Text>
								</HStack>
							) }
							<CardDivider />
							<HStack justify="space-between">
								<Text weight={ 600 }>
									{ term === 'yearly' ? __( 'Total per year' ) : __( 'Total per month' ) }
								</Text>
								<Heading level={ 3 } size={ 16 }>
									{ formatUSD( price.discountedCost ) }
								</Heading>
							</HStack>
						</VStack>
					) }

					{ brand === 'pressable' && plan && (
						<VStack spacing={ 2 }>
							<HStack justify="space-between">
								<Text>{ `Pressable ${ getPressablePlanDisplayName(
									plan.slug,
									plan.name
								) }` }</Text>
								<Text>
									{ plan.yearly_price
										? formatUSD( plan.yearly_price )
										: __( 'Price via products API' ) }
								</Text>
							</HStack>
							<CardDivider />
							<HStack justify="space-between">
								<Text weight={ 600 }>{ __( 'Total per year' ) }</Text>
								<Heading level={ 3 } size={ 16 }>
									{ plan.yearly_price ? formatUSD( plan.yearly_price ) : '—' }
								</Heading>
							</HStack>
						</VStack>
					) }

					<Button variant="primary" __next40pxDefaultSize onClick={ onCheckout }>
						{ __( 'Proceed to checkout' ) }
					</Button>
					<Text variant="muted" size={ 12 }>
						{ __( 'Cancel anytime. Free managed migrations included.' ) }
					</Text>

					<CardDivider />

					{ brand === 'wpcom' && (
						<VStack spacing={ 2 }>
							<Text weight={ 600 }>{ __( 'Start building for free' ) }</Text>
							<Text variant="muted" size={ 12 }>
								{ __(
									'Develop up to 5 WordPress.com sites with free development licenses. Only pay when you launch. 5 of 5 available.'
								) }
							</Text>
							<Button variant="link">{ __( 'Create a development site' ) }</Button>
						</VStack>
					) }

					{ brand === 'pressable' && (
						<VStack spacing={ 2 }>
							<Text weight={ 600 }>{ __( 'Not sure which plan?' ) }</Text>
							<Text variant="muted" size={ 12 }>
								{ __( 'Our experts are happy to give you a one-on-one tour of our platform.' ) }
							</Text>
							<ExternalLink href="https://pressable.com/request-demo">
								{ __( 'Schedule a demo' ) }
							</ExternalLink>
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
