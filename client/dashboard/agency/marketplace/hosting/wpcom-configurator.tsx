import { Badge } from '@automattic/ui';
import {
	__experimentalNumberControl as NumberControl,
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
	getNextDiscountNudge,
	getTieredPrice,
	getVolumeTiers,
	hostingBrands,
	wpcomHosting,
} from './mock-data';
import type { HostingProduct } from './mock-data';

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
	isReferralMode?: boolean;
};

export default function WpcomConfigurator( {
	term,
	onQuantityChange,
	product = wpcomHosting,
	ownedSites = 0,
	isReferralMode = false,
}: WpcomConfiguratorProps ) {
	const [ quantity, setQuantity ] = useState( 3 );

	const price = getTieredPrice( product, quantity, term, ownedSites );
	const nudge = getNextDiscountNudge( product, quantity, term, ownedSites );
	const currentDiscount = price.discountPercent;
	const volumeTiers = getVolumeTiers( product, term );

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
						{ ! isReferralMode && (
							<VStack spacing={ 4 } alignment="stretch">
								<HStack
									justify="flex-start"
									alignment="center"
									spacing={ 4 }
									wrap
									expanded={ false }
								>
									<NumberControl
										className="marketplace-hosting__stepper"
										__next40pxDefaultSize
										isShiftStepEnabled
										min={ 1 }
										label={ __( 'Number of sites' ) }
										hideLabelFromVision
										spinControls="custom"
										value={ String( quantity ) }
										onChange={ ( value ) => {
											const next = Math.max( 1, Number( value ) || 1 );
											setQuantity( next );
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
										<HStack
											spacing={ 2 }
											justify="flex-start"
											alignment="center"
											expanded={ false }
											className={
												'marketplace-hosting__price-secondary' +
												( currentDiscount > 0 ? '' : ' is-hidden' )
											}
										>
											<Text variant="muted" className="marketplace-hosting__price-strikethrough">
												{ formatUSD( price.basePerUnit ) }
											</Text>
											<Badge intent="success">
												{ sprintf(
													/* translators: %d: discount percentage */ __( '%d%% off' ),
													Math.round( Math.max( currentDiscount, 0 ) * 100 )
												) }
											</Badge>
										</HStack>
									</VStack>
								</HStack>
								{ volumeTiers.length > 1 && (
									<div className="marketplace-hosting__volume-grid">
										{ volumeTiers.map( ( tier ) => (
											<button
												key={ tier.quantity }
												type="button"
												className={
													'marketplace-hosting__volume-cell' +
													( tier.quantity === quantity ? ' is-active' : '' )
												}
												onClick={ () => {
													setQuantity( tier.quantity );
													onQuantityChange( tier.quantity );
												} }
											>
												<span className="marketplace-hosting__volume-cell-sites">
													{ sprintf(
														/* translators: %d: number of sites */ _n(
															'%d site',
															'%d sites',
															tier.quantity
														),
														tier.quantity
													) }
												</span>
												<span className="marketplace-hosting__volume-cell-price">
													{ formatUSD( tier.perUnit ) }
												</span>
												<span className="marketplace-hosting__volume-cell-save">
													{ tier.percent > 0
														? sprintf(
																/* translators: %d: discount percentage */ __( '%d%% off' ),
																tier.percent
														  )
														: ' ' }
												</span>
											</button>
										) ) }
									</div>
								) }
							</VStack>
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
