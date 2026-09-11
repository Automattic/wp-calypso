import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	__experimentalDivider as Divider,
	Tooltip,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalNumberControl as NumberControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useAnalytics } from '../../../app/analytics';
import { Callout } from '../../../components/callout';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { TextBlur } from '../../../components/text-blur';
import { DomainUpsellIllustraction } from '../../../sites/overview-domain-upsell-card/upsell-illustration';
import { a4aLink } from '../../../utils/link';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import { getWpcomTieredPrice } from '../products/lib/product-pricing';
import { BrandMark, CheckGrid, HostingFeatures, Testimonials } from './content-sections';
import SelectedPlanCard from './selected-plan-card';
import { useSessionState } from './use-session-state';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

// Past this many owned sites the volume tiers are all reached; the picker goes away.
const MAX_SITES_FOR_TIER_PICKER = 10;
// The volume tiers the design calls out; the price ladder has one for every count.
const TIER_CARD_UNITS = [ 2, 5, 7, 10 ];
const FREE_DEV_LICENSES = 5;

interface Props {
	plan: AgencyProduct;
	term: TermPricing;
	isReferralMode: boolean;
	ownedSites: number;
	isOwnedSitesReady: boolean;
	isAgencyApproved: boolean;
	availableDevSites?: number;
	onAddToCart: ( plan: AgencyProduct, quantity: number ) => void;
}

interface VolumeTier {
	units: number;
	pricePerUnit: number;
	discountPercentage: number;
}

const getBasePrice = ( plan: AgencyProduct, term: TermPricing ) =>
	term === 'yearly' ? plan.yearly_price ?? 0 : plan.monthly_price ?? 0;

// The volume tiers for the term, with the single-site tier always first.
function getVolumeTiers( plan: AgencyProduct, term: TermPricing ): VolumeTier[] {
	const basePrice = getBasePrice( plan, term );
	const tiers = ( term === 'yearly' ? plan.tier_yearly_prices : plan.tier_monthly_prices ) ?? [];
	const options = tiers.map( ( tier ) => ( {
		units: tier.units,
		pricePerUnit: tier.price,
		discountPercentage:
			basePrice > 0 ? Math.round( ( ( basePrice - tier.price ) / basePrice ) * 100 ) : 0,
	} ) );
	if ( options[ 0 ]?.units !== 1 ) {
		options.unshift( { units: 1, pricePerUnit: basePrice, discountPercentage: 0 } );
	}
	return options;
}

// The next cheaper tier above the current total, if any.
function getNextTier(
	tiers: VolumeTier[],
	totalSites: number,
	currentPricePerUnit: number
): VolumeTier | undefined {
	return tiers.find(
		( tier ) => tier.units > totalSites && tier.pricePerUnit < currentPricePerUnit
	);
}

function DevSitesCallout( {
	availableDevSites,
	isAgencyApproved,
}: Pick< Props, 'availableDevSites' | 'isAgencyApproved' > ) {
	const { recordTracksEvent } = useAnalytics();

	// TODO: The classic page opens the site-configurations modal here; the MSD
	// has no development-site creation flow yet, so this opens the classic page.
	const button = (
		<Button
			variant="secondary"
			size="compact"
			href={ a4aLink( '/marketplace/hosting/wpcom' ) }
			disabled={ ! availableDevSites || ! isAgencyApproved }
			onClick={ () => recordTracksEvent( 'calypso_a4a_hosting_page_create_wpcom_dev_site_click' ) }
		>
			{ __( 'Create a development site' ) }
		</Button>
	);

	return (
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
				isAgencyApproved ? (
					button
				) : (
					<Tooltip
						text={ __(
							'Your agency is not yet approved. Please wait for approval before creating a development site.'
						) }
					>
						<span>{ button }</span>
					</Tooltip>
				)
			}
		/>
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
}: Props ) {
	const [ persistedQuantity, setQuantity ] = useSessionState(
		'wpcom-quantity',
		1,
		( stored ) => parseInt( stored, 10 ) || 1
	);
	const quantity = isReferralMode ? 1 : persistedQuantity;

	const pricing = getWpcomTieredPrice( plan, quantity, term, ownedSites );
	const perSiteLabel = term === 'yearly' ? __( '/site per year' ) : __( '/site per month' );
	const termSuffix = term === 'yearly' ? __( '/year' ) : __( '/month' );
	const billedLabel = term === 'yearly' ? __( 'billed annually' ) : __( 'billed monthly' );

	const allTiers = getVolumeTiers( plan, term );
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
		<div className="dashboard-marketplace-hosting__layout">
			<VStack spacing={ 8 } justify="flex-start">
				<VStack spacing={ 4 }>
					<Card>
						<CardHeader>
							<SectionHeader
								className="dashboard-marketplace-hosting__card-header"
								level={ 3 }
								title={ __( 'Purchase WordPress.com' ) }
								description={ __(
									'Managed WordPress priced per site, with volume discounts, staging, backups, and 24/7 expert support.'
								) }
								decoration={ <BrandMark src={ wpcomDescriptor } /> }
							/>
						</CardHeader>
						<CardBody>
							<VStack spacing={ 5 }>
								<VStack spacing={ 3 }>
									<HStack justify="space-between" alignment="center">
										<Heading level={ 4 } size={ 13 }>
											{ getQuantityHeading() }
										</Heading>
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
														spinControls="custom"
														value={ String( quantity ) }
														onChange={ ( value ) =>
															setQuantity( Math.max( 1, parseInt( String( value ), 10 ) || 1 ) )
														}
													/>
												</div>
												<VStack spacing={ 1 } alignment="flex-start">
													<Text weight={ 600 }>
														<span>{ formatCurrency( pricing.pricePerUnit, plan.currency ) }</span>
														<Text as="span" variant="muted">
															{ perSiteLabel }
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
																<s>{ formatCurrency( pricing.basePricePerUnit, plan.currency ) }</s>
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
												<div
													className="dashboard-marketplace-hosting__tiers"
													role="group"
													aria-label={ __( 'Volume tiers' ) }
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
																			{ formatCurrency( tier.pricePerUnit, plan.currency ) }
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
								{ formatCurrency( pricing.discountedCost, plan.currency ) }
							</TextBlur>
							<Text as="span" variant="muted" size={ 13 } weight={ 400 }>
								{ termSuffix }
							</Text>
						</Text>
					}
					notes={
						isOwnedSitesReady &&
						pricing.discountPercentage > 0 && (
							<VStack spacing={ 1 }>
								<Text variant="muted">
									<s>{ formatCurrency( pricing.actualCost, plan.currency ) }</s>
									<span>
										{ ' · ' +
											sprintf(
												/* translators: %s is the amount saved, e.g. "US$300.00". */
												__( 'Save %s' ),
												formatCurrency( pricing.actualCost - pricing.discountedCost, plan.currency )
											) +
											' · ' +
											billedLabel }
									</span>
								</Text>
								{ ownedSites > 0 && (
									<Text variant="muted">
										{ sprintf(
											/* translators: %1$d is the discount percentage, %2$d the total number of sites, %3$d the sites already owned. */
											__( '%1$d%% off at %2$d total sites. Your %3$d existing sites count.' ),
											pricing.discountPercentage,
											ownedSites + quantity,
											ownedSites
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
				/>
			</div>
		</div>
	);
}
