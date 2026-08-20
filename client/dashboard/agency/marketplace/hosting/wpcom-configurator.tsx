import {
	Button,
	Icon,
	TextControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody, CardDivider } from '../../../components/card';
import wpcomLogo from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { getNextDiscountNudge, getTieredPrice, formatUSD, wpcomHosting } from './mock-data';

const PRESET_QUANTITIES = [ 1, 3, 5 ];

const EVERY_SITE_INCLUDES = [
	'50GB of storage',
	'Global CDN with 28+ locations',
	'Free staging site',
	'Real-time backups',
	'Unrestricted bandwidth',
	'24/7 expert support',
];

type WpcomConfiguratorProps = {
	term: 'monthly' | 'yearly';
	onAddToCart: ( quantity: number, total: number ) => void;
};

export default function WpcomConfigurator( { term, onAddToCart }: WpcomConfiguratorProps ) {
	const [ preset, setPreset ] = useState< string >( '3' );
	const [ customQuantity, setCustomQuantity ] = useState( 10 );

	const isCustom = preset === 'custom';
	const quantity = isCustom ? customQuantity : Number( preset );
	const price = getTieredPrice( wpcomHosting, quantity, term );
	const nudge = getNextDiscountNudge( wpcomHosting, quantity, term );
	const hasDiscount = price.discountPercent > 0;
	const savedAmount = price.actualCost - price.discountedCost;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack spacing={ 2 }>
						<img
							src={ wpcomLogo }
							alt="WordPress.com"
							className="marketplace-hosting__brand-logo"
						/>
						<Text variant="muted">{ __( 'Managed hosting built by Automattic' ) }</Text>
					</VStack>

					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 13 }>
							{ __( 'How many sites do you need?' ) }
						</Heading>
						<ToggleGroupControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							isBlock
							hideLabelFromVision
							label={ __( 'Number of sites' ) }
							value={ preset }
							onChange={ ( value ) => setPreset( String( value ) ) }
						>
							{ PRESET_QUANTITIES.map( ( q ) => (
								<ToggleGroupControlOption key={ q } value={ String( q ) } label={ String( q ) } />
							) ) }
							<ToggleGroupControlOption value="custom" label={ __( 'Custom' ) } />
						</ToggleGroupControl>
						{ isCustom && (
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								type="number"
								min={ 1 }
								label={ __( 'Number of sites' ) }
								value={ String( customQuantity ) }
								onChange={ ( value ) => setCustomQuantity( Math.max( 1, Number( value ) || 1 ) ) }
							/>
						) }
						{ nudge && (
							<Text variant="muted">
								{ sprintf(
									/* translators: %1$d: number of sites to add, %2$d: discount percentage */
									_n(
										'Add %1$d more site to unlock %2$d%% off.',
										'Add %1$d more sites to unlock %2$d%% off.',
										nudge.addMore
									),
									nudge.addMore,
									Math.round( nudge.discountPercent * 100 )
								) }
							</Text>
						) }
					</VStack>

					<CardDivider />

					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 13 }>
							{ __( 'Every site includes' ) }
						</Heading>
						<div className="marketplace-hosting__includes">
							{ EVERY_SITE_INCLUDES.map( ( feature ) => (
								<HStack key={ feature } spacing={ 2 } justify="flex-start" alignment="center">
									<Icon icon={ check } className="marketplace-hosting__check" />
									<Text>{ feature }</Text>
								</HStack>
							) ) }
						</div>
					</VStack>

					<CardDivider />

					<HStack justify="space-between" alignment="flex-start">
						<VStack spacing={ 1 }>
							<HStack spacing={ 2 } justify="flex-start" alignment="baseline">
								{ hasDiscount && (
									<Text variant="muted" className="marketplace-hosting__price-strikethrough">
										{ formatUSD( price.actualCost ) }
									</Text>
								) }
								<Heading level={ 3 } size={ 20 }>
									{ formatUSD( price.discountedCost ) }
								</Heading>
								{ hasDiscount && (
									<Text variant="muted">
										{ sprintf(
											/* translators: %d: discount percentage */
											__( 'You save %d%%' ),
											Math.round( price.discountPercent * 100 )
										) }
									</Text>
								) }
							</HStack>
							<Text variant="muted">
								{ term === 'yearly'
									? sprintf(
											/* translators: %s: amount saved per year */
											__( 'Per year, billed yearly. You save %s.' ),
											formatUSD( savedAmount )
									  )
									: __( 'Per month, billed monthly.' ) }
							</Text>
						</VStack>
						<Button
							variant="primary"
							__next40pxDefaultSize
							onClick={ () => onAddToCart( quantity, price.discountedCost ) }
						>
							{ sprintf(
								/* translators: %d: number of sites */
								_n( 'Add %d site to cart', 'Add %d sites to cart', quantity ),
								quantity
							) }
						</Button>
					</HStack>

					<Text variant="muted">{ __( 'Cancel anytime. Free managed migrations included.' ) }</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}
