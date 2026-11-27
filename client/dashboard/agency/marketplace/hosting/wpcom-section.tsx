import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalNumberControl as NumberControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useLocale } from '../../../app/locale';
import { Callout } from '../../../components/callout';
import { Card, CardBody, CardDivider } from '../../../components/card';
import Divider from '../../../components/divider';
import { TextBlur } from '../../../components/text-blur';
import { DomainUpsellIllustraction } from '../../../sites/domains/components/domain-upsell-card/upsell-illustration';
import { formatDate } from '../../../utils/datetime';
import { ApprovalGate, useIsApprovalGated } from '../../approval-gate';
import { useRecordViewOnce } from '../../lib/use-record-view-once';
import { getWpcomTieredPrice, getWpcomTierPrices } from '../products/lib/product-pricing';
import { MAX_CART_ITEM_QUANTITY } from '../products/use-shopping-cart';
import { DevSiteConfigurationModal } from '../purchases/site-configuration-modal';
import { CheckGrid, HostingFeatures, Testimonials } from './content-sections';
import { getTermPrice } from './lib/term-price';
import SelectedPlanCard from './selected-plan-card';
import StepHeading from './step-heading';
import { useSessionState } from './use-session-state';
import type { WpcomTierPrice } from '../products/lib/product-pricing';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct, AgencyProductPromotion } from '@automattic/api-core';
import type { CSSProperties } from 'react';

// Past this many owned sites the volume tiers are all reached; the picker goes away.
const MAX_SITES_FOR_TIER_PICKER = 10;
// The volume tiers the design calls out; the price ladder has one for every count.
const TIER_CARD_UNITS = [ 2, 5, 7, 10 ];
const FREE_DEV_LICENSES = 5;

interface WpcomSectionProps {
	plan: AgencyProduct;
	term: TermPricing;
	isReferralMode: boolean;
	ownedSites: number;
	isOwnedSitesReady: boolean;
	isAgencyApproved: boolean;
	availableDevSites?: number;
	onAddToCart: ( plan: AgencyProduct, quantity: number ) => void;
}

// The next cheaper tier above the current total, if any.
function getNextTier(
	tiers: WpcomTierPrice[],
	totalSites: number,
	currentPricePerUnit: number
): WpcomTierPrice | undefined {
	return tiers.find(
		( tier ) => tier.units > totalSites && tier.pricePerUnit < currentPricePerUnit
	);
}

function PromotionFootnote( {
	promotion,
	term,
	isReferralMode,
}: {
	promotion: AgencyProductPromotion;
	term: TermPricing;
	isReferralMode: boolean;
} ) {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const purchaseMode = isReferralMode ? 'referral' : 'regular';
	useRecordViewOnce(
		`wpcom-promotion:${ term }:${ purchaseMode }`,
		useCallback(
			() =>
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_wpcom_promotion_view', {
					discount: promotion.discount,
					term,
					purchase_mode: purchaseMode,
				} ),
			[ recordTracksEvent, promotion.discount, term, purchaseMode ]
		)
	);
	return (
		<Text variant="muted" size={ 12 }>
			{ sprintf(
				/* translators: %1$d is the promotion's discount percentage, %2$s the day it ends, e.g. "Dec 4". */
				__( '*Includes %1$d%% off for a limited time. Ends %2$s.' ),
				promotion.discount,
				formatDate( new Date( promotion.ends_at ), locale, { month: 'short', day: 'numeric' } )
			) }
		</Text>
	);
}

function DevSitesCallout( {
	availableDevSites,
	isAgencyApproved,
}: Pick< WpcomSectionProps, 'availableDevSites' | 'isAgencyApproved' > ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isConfiguringSite, setIsConfiguringSite ] = useState( false );
	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

	return (
		<>
			{ isGateOpen && <ApprovalGate kind="dev-site" onClose={ () => setIsGateOpen( false ) } /> }
			{ isConfiguringSite && (
				<DevSiteConfigurationModal closeModal={ () => setIsConfiguringSite( false ) } />
			) }
			<Callout
				title={ __( 'Not ready to launch yet? Start building for free' ) }
				titleAs="h3"
				description={
					<Text variant="muted">
						{ sprintf(
							/* translators: %1$d is the number of free development licenses, %2$d how many are still available. */
							__(
								'Create up to %1$d WordPress.com development sites and only pay when you launch. %2$d of %1$d available.'
							),
							FREE_DEV_LICENSES,
							availableDevSites ?? 0
						) }
					</Text>
				}
				image={
					<DomainUpsellIllustraction
						title={ __( 'Development site' ) }
						domain="yourclient.wpcomstaging.com"
						search="yourclient"
					/>
				}
				imageVariant="full-bleed"
				actions={
					<Button
						variant="secondary"
						size="compact"
						disabled={ ! isGated && ( ! availableDevSites || ! isAgencyApproved ) }
						onClick={ () => {
							if ( isGated ) {
								setIsGateOpen( true );
								return;
							}
							recordTracksEvent( 'calypso_a4a_hosting_page_create_wpcom_dev_site_click' );
							setIsConfiguringSite( true );
						} }
					>
						{ __( 'Create a development site' ) }
					</Button>
				}
			/>
		</>
	);
}

export default function WpcomSection( {
	plan,
	term,
	isReferralMode,
	ownedSites,
	isOwnedSitesReady,
	isAgencyApproved,
	availableDevSites,
	onAddToCart,
}: WpcomSectionProps ) {
	const [ persistedQuantity, setQuantity ] = useSessionState(
		'wpcom-quantity',
		1,
		( stored ) => parseInt( stored, 10 ) || 1
	);
	const quantity = isReferralMode ? 1 : persistedQuantity;

	const pricing = getWpcomTieredPrice( plan, quantity, term, ownedSites );
	const termPrice = getTermPrice( pricing.discountedCost, plan.currency, term );
	const savedAmount = formatCurrency( pricing.actualCost - pricing.discountedCost, plan.currency );
	const { promotion } = pricing;
	const getSaveNote = () => {
		if ( promotion ) {
			return term === 'monthly'
				? sprintf(
						/* translators: %s is the amount saved, e.g. "US$300.00". The asterisk marks a limited time offer. */
						__( 'Save %s* · billed monthly' ),
						savedAmount
					)
				: sprintf(
						/* translators: %s is the amount saved, e.g. "US$300.00". The asterisk marks a limited time offer. */
						__( 'Save %s*' ),
						savedAmount
					);
		}
		return term === 'monthly'
			? sprintf(
					/* translators: %s is the amount saved, e.g. "US$300.00". */
					__( 'Save %s · billed monthly' ),
					savedAmount
				)
			: sprintf(
					/* translators: %s is the amount saved, e.g. "US$300.00". */
					__( 'Save %s' ),
					savedAmount
				);
	};
	const saveNote = getSaveNote();
	// Per-site prices read per month too.
	const getMonthlyUnitPrice = ( amount: number ) =>
		formatCurrency( term === 'yearly' ? amount / 12 : amount, plan.currency );

	const allTiers = getWpcomTierPrices( plan, term );
	const tiers = allTiers.filter(
		( tier ) => TIER_CARD_UNITS.includes( tier.units ) && tier.units > ownedSites
	);
	const showTierPicker = ! isReferralMode && ownedSites < MAX_SITES_FOR_TIER_PICKER;
	const maxTierUnits = tiers[ tiers.length - 1 ]?.units ?? 0;
	const isOverMaxTier = quantity + ownedSites > maxTierUnits;
	const selectedTierUnits = isOverMaxTier ? maxTierUnits : quantity + ownedSites;
	// Past the last tier every extra site is priced the same, so the last card
	// stays selected instead of pulling the quantity back down.
	const selectTier = ( units: number ) => {
		if ( units === maxTierUnits && isOverMaxTier ) {
			return;
		}
		setQuantity( units - ownedSites );
	};
	const nextTier = getNextTier( allTiers, quantity + ownedSites, pricing.pricePerUnit );

	const siteCountLabel =
		ownedSites > 0
			? sprintf(
					/* translators: %d is the number of new WordPress.com sites. */
					_n( '%d new WordPress.com site', '%d new WordPress.com sites', quantity ),
					quantity
				)
			: sprintf(
					/* translators: %d is the number of WordPress.com sites. */
					_n( '%d WordPress.com site', '%d WordPress.com sites', quantity ),
					quantity
				);

	const ctaLabel = isReferralMode
		? __( 'Add to referral' )
		: sprintf(
				/* translators: %d is the number of WordPress.com sites. */
				_n( 'Add %d site to cart', 'Add %d sites to cart', quantity ),
				quantity
			);

	const getQuantityHeading = () => {
		if ( isReferralMode ) {
			return __( 'Refer WordPress.com hosting' );
		}
		return ownedSites > 0
			? __( 'How many more sites do you need?' )
			: __( 'How many sites do you need?' );
	};

	const getNudge = () => {
		if ( nextTier ) {
			return sprintf(
				/* translators: %1$d is the number of sites to add, %2$d the discount percentage. */
				_n(
					'Add %1$d more site to unlock %2$d%% off.',
					'Add %1$d more sites to unlock %2$d%% off.',
					nextTier.units - quantity - ownedSites
				),
				nextTier.units - quantity - ownedSites,
				nextTier.discountPercentage
			);
		}
		if ( pricing.discountPercentage > 0 ) {
			return sprintf(
				/* translators: %d is the discount percentage. */
				__( 'You’ve unlocked the maximum %d%% discount.' ),
				pricing.discountPercentage
			);
		}
		return null;
	};
	const nudge = getNudge();

	return (
		<div className="dashboard-marketplace-hosting__layout has-buy-bar">
			<VStack spacing={ 4 } className="dashboard-marketplace-hosting__layout-steps">
				<Card>
					<CardBody>
						<VStack spacing={ 5 }>
							<VStack spacing={ 3 }>
								<HStack justify="space-between" alignment="center" wrap>
									<StepHeading step={ 1 }>{ getQuantityHeading() }</StepHeading>
									{ ! isReferralMode && ownedSites > 0 && (
										<Badge>
											{ sprintf(
												/* translators: %d is the number of WordPress.com sites the agency owns. */
												_n( 'You own %d site', 'You own %d sites', ownedSites ),
												ownedSites
											) }
										</Badge>
									) }
								</HStack>
								{ isReferralMode && (
									<Text variant="muted">
										{ __(
											'Refer a single site to your client. They’re billed directly at the standard rate, and you earn commission on every payment, paid out quarterly.'
										) }
									</Text>
								) }
								{ ! isReferralMode && (
									<VStack spacing={ 4 }>
										<HStack
											justify="flex-start"
											alignment="flex-start"
											spacing={ 4 }
											wrap
											expanded={ false }
										>
											<div className="dashboard-marketplace-hosting__stepper">
												<NumberControl
													__next40pxDefaultSize
													label={ __( 'Number of sites' ) }
													hideLabelFromVision
													min={ 1 }
													max={ MAX_CART_ITEM_QUANTITY }
													spinControls="custom"
													value={ String( quantity ) }
													onChange={ ( value ) =>
														setQuantity(
															Math.min(
																MAX_CART_ITEM_QUANTITY,
																Math.max( 1, parseInt( String( value ), 10 ) || 1 )
															)
														)
													}
												/>
											</div>
											<VStack spacing={ 1 } alignment="flex-start">
												<Text weight={ 600 }>
													<span>{ getMonthlyUnitPrice( pricing.pricePerUnit ) }</span>
													<Text as="span" variant="muted">
														{ __( '/site per month' ) }
													</Text>
												</Text>
												{ pricing.discountPercentage > 0 && (
													<HStack
														spacing={ 2 }
														justify="flex-start"
														alignment="center"
														expanded={ false }
													>
														<Text variant="muted">
															<s>{ getMonthlyUnitPrice( pricing.basePricePerUnit ) }</s>
														</Text>
														<Badge intent="stable">
															{ sprintf(
																/* translators: %d is the discount percentage. */
																__( '%d%% off' ),
																pricing.discountPercentage
															) }
														</Badge>
													</HStack>
												) }
											</VStack>
										</HStack>
										{ nudge && <Text variant="muted">{ nudge }</Text> }
										{ showTierPicker && tiers.length > 0 && (
											<VStack className="dashboard-marketplace-hosting__tiers-frame">
												<div
													className="dashboard-marketplace-hosting__tiers"
													role="group"
													aria-label={ __( 'Volume tiers' ) }
													style={
														{
															'--tier-count': tiers.length,
															'--tier-narrow-columns': tiers.length % 2 ? 1 : 2,
														} as CSSProperties
													}
												>
													{ tiers.map( ( tier ) => {
														const isSelected = tier.units === selectedTierUnits;
														return (
															<Card
																key={ tier.units }
																className={ clsx( 'dashboard-marketplace-hosting__tier', {
																	'is-selected': isSelected,
																} ) }
																role="button"
																aria-pressed={ isSelected }
																tabIndex={ 0 }
																onClick={ () => selectTier( tier.units ) }
																onKeyDown={ ( event: React.KeyboardEvent ) => {
																	if ( event.key === 'Enter' || event.key === ' ' ) {
																		event.preventDefault();
																		selectTier( tier.units );
																	}
																} }
															>
																<CardBody>
																	<VStack spacing={ 1 }>
																		<Text weight={ 600 }>
																			{ sprintf(
																				/* translators: %d is the number of sites. */
																				_n( '%d site', '%d sites', tier.units ),
																				tier.units
																			) }
																		</Text>
																		<Text variant="muted" size={ 12 }>
																			<span>{ getMonthlyUnitPrice( tier.pricePerUnit ) }</span>
																			{ tier.pricePerUnit < tier.regularPricePerUnit && (
																				<span>
																					{ ' ' }
																					<s>{ getMonthlyUnitPrice( tier.regularPricePerUnit ) }</s>
																				</span>
																			) }
																		</Text>
																		<Text
																			size={ 12 }
																			className="dashboard-marketplace-hosting__tier-discount"
																		>
																			{ tier.discountPercentage > 0
																				? sprintf(
																						/* translators: %d is the discount percentage. */
																						__( '%d%% off' ),
																						tier.discountPercentage
																					)
																				: '' }
																		</Text>
																	</VStack>
																</CardBody>
															</Card>
														);
													} ) }
												</div>
											</VStack>
										) }
									</VStack>
								) }
							</VStack>
							<CardDivider />
							<VStack spacing={ 3 }>
								<Heading level={ 4 } size={ 13 }>
									{ __( 'What’s included' ) }
								</Heading>
								<CheckGrid
									columns={ 3 }
									items={ [
										__( '50GB of storage' ),
										__( 'Free staging site' ),
										__( 'Unrestricted bandwidth' ),
										__( 'Global CDN with 28+ locations' ),
										__( 'Real-time backups' ),
										__( '24/7 expert support' ),
									] }
								/>
							</VStack>
						</VStack>
					</CardBody>
				</Card>
				<DevSitesCallout
					availableDevSites={ availableDevSites }
					isAgencyApproved={ isAgencyApproved }
				/>
			</VStack>
			<VStack spacing={ 8 } className="dashboard-marketplace-hosting__layout-more">
				<Divider style={ { color: 'var(--dashboard-overview__divider-color)' } } />
				<HostingFeatures brand="wpcom" showFreeDomain={ term !== 'monthly' } />
				<Testimonials brand="wpcom" />
			</VStack>
			<div className="dashboard-marketplace-hosting__rail">
				<SelectedPlanCard
					label={ siteCountLabel }
					price={
						<Text size={ 24 } weight={ 600 } className="dashboard-marketplace-hosting__rail-price">
							<TextBlur isBlurred={ ! isOwnedSitesReady } length={ 9 }>
								{ termPrice.price }
							</TextBlur>
							<Text as="span" variant="muted" size={ 13 } weight={ 400 }>
								{ __( '/month' ) }
							</Text>
						</Text>
					}
					compactPrice={ isOwnedSitesReady ? termPrice.price : undefined }
					notes={
						isOwnedSitesReady && (
							<VStack spacing={ 1 }>
								{ termPrice.billed && <Text variant="muted">{ termPrice.billed }</Text> }
								{ pricing.discountPercentage > 0 && (
									<Text variant="muted">
										<s>{ formatCurrency( pricing.actualCost, plan.currency ) }</s>
										<span>{ ' · ' + saveNote }</span>
									</Text>
								) }
								{ pricing.discountPercentage > 0 && ownedSites > 0 && (
									<Text variant="muted">
										{ sprintf(
											/* translators: %1$d is the discount percentage, %2$s the total number of sites. */
											_n(
												'%1$d%% off at %2$s total site.',
												'%1$d%% off at %2$s total sites.',
												ownedSites + quantity
											),
											pricing.discountPercentage,
											formatNumber( ownedSites + quantity )
										) +
											' ' +
											sprintf(
												/* translators: %s is the number of sites the agency already owns. */
												_n(
													'Your %s existing site counts.',
													'Your %s existing sites count.',
													ownedSites
												),
												formatNumber( ownedSites )
											) }
									</Text>
								) }
							</VStack>
						)
					}
					action={
						<Button
							variant="primary"
							__next40pxDefaultSize
							disabled={ ! isOwnedSitesReady }
							onClick={ () => onAddToCart( plan, quantity ) }
						>
							{ ctaLabel }
						</Button>
					}
					assurance={
						isReferralMode
							? __( 'Commission on every payment your client makes, paid out quarterly.' )
							: __( 'Cancel anytime.' )
					}
					footnote={
						promotion && isOwnedSitesReady ? (
							<PromotionFootnote
								promotion={ promotion }
								term={ term }
								isReferralMode={ isReferralMode }
							/>
						) : undefined
					}
				/>
			</div>
		</div>
	);
}
