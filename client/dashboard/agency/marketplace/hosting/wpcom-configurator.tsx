import {
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
import { Card, CardBody, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { getNextDiscountNudge, hostingBrands, wpcomHosting } from './mock-data';

const PRESET_QUANTITIES = [ 1, 3, 5 ];

const WHATS_INCLUDED = [
	'50GB of storage',
	'Free staging site',
	'Unrestricted bandwidth',
	'Global CDN with 28+ locations',
	'Real-time backups',
	'24/7 expert support',
];

type WpcomConfiguratorProps = {
	term: 'monthly' | 'yearly';
	onQuantityChange: ( quantity: number ) => void;
};

export default function WpcomConfigurator( { term, onQuantityChange }: WpcomConfiguratorProps ) {
	const [ preset, setPreset ] = useState< string >( '3' );
	const [ customQuantity, setCustomQuantity ] = useState( 10 );

	const isCustom = preset === 'custom';
	const quantity = isCustom ? customQuantity : Number( preset );
	const nudge = getNextDiscountNudge( wpcomHosting, quantity, term );

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={ __( 'Configure WordPress.com' ) }
					description={ hostingBrands.find( ( brand ) => brand.key === 'wpcom' )?.description }
					decoration={
						<img src={ wpcomDescriptor } alt="" className="marketplace-hosting__brand-mark" />
					}
				/>
			</CardHeader>
			<CardBody>
				<div className="marketplace-hosting__config-grid">
					<VStack spacing={ 3 } justify="flex-start">
						<Heading level={ 3 } size={ 15 }>
							{ __( 'How many sites do you need?' ) }
						</Heading>
						<ToggleGroupControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							isBlock
							hideLabelFromVision
							label={ __( 'Number of sites' ) }
							value={ preset }
							onChange={ ( value ) => {
								setPreset( String( value ) );
								onQuantityChange( String( value ) === 'custom' ? customQuantity : Number( value ) );
							} }
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
								onChange={ ( value ) => {
									const next = Math.max( 1, Number( value ) || 1 );
									setCustomQuantity( next );
									onQuantityChange( next );
								} }
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
					<VStack spacing={ 3 } justify="flex-start">
						<Heading level={ 3 } size={ 15 }>
							{ __( 'What’s included' ) }
						</Heading>
						<VStack spacing={ 2 }>
							{ WHATS_INCLUDED.map( ( feature ) => (
								<HStack key={ feature } spacing={ 2 } justify="flex-start" alignment="center">
									<Icon icon={ check } className="marketplace-hosting__check" />
									<Text>{ feature }</Text>
								</HStack>
							) ) }
						</VStack>
					</VStack>
				</div>
			</CardBody>
		</Card>
	);
}
