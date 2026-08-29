import { Badge } from '@automattic/ui';
import {
	Button,
	__experimentalNumberControl as NumberControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { CheckGrid } from './content-sections';
import {
	formatUSD,
	getDiscountMilestones,
	getNextDiscountNudge,
	getTieredPrice,
	hostingBrands,
	wpcomHosting,
} from './mock-data';
import type { HostingProduct } from './mock-data';

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
	product?: HostingProduct;
	ownedSites?: number;
	altQuantityControl?: boolean;
	isReferralMode?: boolean;
};

export default function WpcomConfigurator( {
	term,
	onQuantityChange,
	product = wpcomHosting,
	ownedSites = 0,
	altQuantityControl = false,
	isReferralMode = false,
}: WpcomConfiguratorProps ) {
	const [ preset, setPreset ] = useState< string >( '3' );
	const [ customQuantity, setCustomQuantity ] = useState( altQuantityControl ? 3 : 10 );

	const isCustom = altQuantityControl || preset === 'custom';
	const quantity = isCustom ? customQuantity : Number( preset );
	const price = getTieredPrice( product, quantity, term, ownedSites );
	const nudge = getNextDiscountNudge( product, quantity, term, ownedSites );
	const milestones = getDiscountMilestones( product, quantity, term, ownedSites );
	const currentDiscount = price.discountPercent;

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					className="marketplace-hosting__card-header"
					level={ 3 }
					title={ __( 'Configure WordPress.com' ) }
					description={ hostingBrands.find( ( brand ) => brand.key === 'wpcom' )?.description }
					decoration={
						<img src={ wpcomDescriptor } alt="" className="marketplace-hosting__brand-mark" />
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack spacing={ 3 }>
						<HStack justify="space-between" alignment="center">
							<Heading level={ 3 } size={ 13 }>
								{ isReferralMode && __( 'Refer WordPress.com hosting' ) }
								{ ! isReferralMode &&
									( ownedSites > 0
										? __( 'How many more sites do you need?' )
										: __( 'How many sites do you need?' ) ) }
							</Heading>
							{ ! isReferralMode && ownedSites > 0 && (
								<Badge>
									{ sprintf(
										/* translators: %d: number of sites the agency already owns */
										_n( 'You own %d site', 'You own %d sites', ownedSites ),
										ownedSites
									) }
								</Badge>
							) }
						</HStack>
						{ isReferralMode && (
							<Text variant="muted">
								{ __(
									'Refer a single site to your client. They’re billed directly at the standard rate, and you earn commission when they pay.'
								) }
							</Text>
						) }
						{ ! isReferralMode && ! altQuantityControl && (
							<ToggleGroupControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								isBlock
								hideLabelFromVision
								label={ __( 'Number of sites' ) }
								value={ preset }
								onChange={ ( value ) => {
									setPreset( String( value ) );
									onQuantityChange(
										String( value ) === 'custom' ? customQuantity : Number( value )
									);
								} }
							>
								{ PRESET_QUANTITIES.map( ( q ) => (
									<ToggleGroupControlOption key={ q } value={ String( q ) } label={ String( q ) } />
								) ) }
								<ToggleGroupControlOption value="custom" label={ __( 'Custom' ) } />
							</ToggleGroupControl>
						) }
						{ ! isReferralMode && isCustom && (
							<HStack justify="flex-start" alignment="center" spacing={ 4 } wrap expanded={ false }>
								<NumberControl
									className="marketplace-hosting__stepper"
									__next40pxDefaultSize
									isShiftStepEnabled
									min={ 1 }
									label={ __( 'Number of sites' ) }
									hideLabelFromVision
									spinControls="custom"
									value={ String( customQuantity ) }
									onChange={ ( value ) => {
										const next = Math.max( 1, Number( value ) || 1 );
										setCustomQuantity( next );
										onQuantityChange( next );
									} }
								/>
								<VStack spacing={ 1 } alignment="flex-start">
									<Text weight={ 600 }>
										{ formatUSD( price.perUnit ) }
										<Text as="span" variant="muted">
											{ __( '/site per year' ) }
										</Text>
									</Text>
									{ currentDiscount > 0 && (
										<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
											<Text variant="muted" className="marketplace-hosting__price-strikethrough">
												{ formatUSD( price.basePerUnit ) }
											</Text>
											<Badge intent="success">
												{ sprintf(
													/* translators: %d: discount percentage */
													__( '%d%% off' ),
													Math.round( currentDiscount * 100 )
												) }
											</Badge>
										</HStack>
									) }
								</VStack>
								{ milestones.length > 0 && (
									<VStack spacing={ 1 } alignment="flex-start">
										<Text size={ 11 } weight={ 600 } variant="muted" upperCase>
											{ __( 'Buy more, save more' ) }
										</Text>
										<HStack spacing={ 2 } justify="flex-start" expanded={ false } wrap>
											{ milestones.map( ( milestone ) => (
												<Button
													key={ milestone.quantity }
													className="marketplace-hosting__tier-chip"
													onClick={ () => {
														setCustomQuantity( milestone.quantity );
														onQuantityChange( milestone.quantity );
													} }
												>
													{ sprintf(
														/* translators: %1$d: number of sites, %2$d: discount percentage */
														__( '%1$d sites · %2$d%% off' ),
														milestone.quantity,
														milestone.discountPercent
													) }
												</Button>
											) ) }
										</HStack>
									</VStack>
								) }
							</HStack>
						) }
						{ ! isReferralMode &&
							( nudge ? (
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
							) : (
								<Text variant="muted">
									{ sprintf(
										/* translators: %d: discount percentage */
										__( 'You’ve unlocked the maximum %d%% discount.' ),
										Math.round( currentDiscount * 100 )
									) }
								</Text>
							) ) }
					</VStack>
					<CardDivider />
					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 13 }>
							{ __( 'What’s included' ) }
						</Heading>
						<CheckGrid items={ WHATS_INCLUDED } columns={ 3 } />
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
