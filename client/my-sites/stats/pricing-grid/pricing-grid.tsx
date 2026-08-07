import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ProductsList } from '@automattic/data-stores';
import { getCurrencyObject } from '@automattic/number-formatters';
import { Button, ExternalLink } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useDismissPricingGrid, { PRICING_GRID_REFERRER } from './hooks/use-dismiss-pricing-grid';
import './style.scss';

interface PlanValue {
	isIncluded: boolean;
	/** Overrides the default Included / Not included label on every viewport. */
	label?: string;
	strong?: boolean;
}

interface Feature {
	name: string;
	paid: PlanValue;
	free: PlanValue;
}

interface PricingGridProps {
	/** Called when the visitor picks a plan, so the host can reveal the dashboard. */
	onDismiss?: () => void;
}

/**
 * Replicates the Jetpack Search upsell's PricingTable rendering (DOM structure and
 * styles ported from `@automattic/jetpack-components`, which Calypso does not ship)
 * using `@wordpress/components` primitives, so the Stats plan choice looks identical
 * to the Search one. Gating lives in `gate.tsx`; by the time this renders the site
 * is known to be eligible and undismissed.
 */
export default function PricingGrid( { onDismiss }: PricingGridProps ) {
	const translate = useTranslate();
	// Same breakpoint the jetpack-components PricingTable uses via useViewportMatch.
	const isLg = useViewportMatch( 'large' );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const dismissPricingGrid = useDismissPricingGrid( siteId );

	useEffect( () => {
		trackStatsAnalyticsEvent( 'stats_pricing_grid_view', { blog_id: siteId } );
	}, [ siteId ] );

	const product = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.RawAPIProduct | null;

	// The four paid differentiators lead (bolded via `strong`, with the default
	// Included / feature-name labels so the mobile fallback still names the feature);
	// everything below them is shared by both plans.
	const features: Feature[] = [
		{
			name: String( translate( 'UTM tracking' ) ),
			paid: { isIncluded: true, strong: true },
			free: { isIncluded: false },
		},
		{
			name: String( translate( 'Device stats' ) ),
			paid: { isIncluded: true, strong: true },
			free: { isIncluded: false },
		},
		{
			name: String( translate( 'Locations' ) ),
			paid: { isIncluded: true, label: String( translate( 'Region and city' ) ), strong: true },
			free: { isIncluded: true, label: String( translate( 'Country-level' ) ) },
		},
		{
			name: String( translate( 'Priority support' ) ),
			paid: { isIncluded: true, strong: true },
			free: { isIncluded: false },
		},
		{
			name: String( translate( 'Views and visitors' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Top posts and pages' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Referrers and clicks' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Search terms' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Authors' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Downloads and video plays' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Insights and subscribers' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'Full history' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
		{
			name: String( translate( 'GDPR-compliant' ) ),
			paid: { isIncluded: true },
			free: { isIncluded: true },
		},
	];

	const paidLabel = String( translate( 'Get Paid Stats' ) );
	const freeLabel = String( translate( 'Start for free' ) );

	// Starting for free is a plan choice: record the dismissal and reveal the dashboard.
	// The reveal is same-route (the gate's local state plus the cache patch), so the
	// server round-trip isn't awaited here — only swallowed to avoid an unhandled
	// rejection; the mutation's own retry covers transient failures.
	const startForFree = () => {
		trackStatsAnalyticsEvent( 'stats_pricing_grid_free_cta_clicked', { blog_id: siteId } );
		dismissPricingGrid().catch( () => null );
		onDismiss?.();
	};

	// Deliberately not a dismissal: heading to the purchase page is not a plan choice
	// yet, so an abandoned checkout brings the visitor back to the grid; the purchase
	// page's "I will do it later" records the dismissal instead. Navigate
	// programmatically rather than via href so the link also works under Odyssey's
	// hashbang routing when the wp-admin click shim doesn't apply (e.g. middle-click).
	const goToPurchase = () => {
		trackStatsAnalyticsEvent( 'stats_pricing_grid_paid_cta_clicked', { blog_id: siteId } );
		page( `/stats/purchase/${ siteSlug }?from=${ PRICING_GRID_REFERRER }` );
	};

	const renderPrice = ( value: number, currency: string, hidePriceFraction: boolean ) => {
		const { symbol, symbolPosition, integer, fraction } = getCurrencyObject( value, currency );
		const showPriceFraction = ! hidePriceFraction || ! fraction.endsWith( '00' );
		// Some locales put the currency symbol after the amount (e.g. de-DE EUR).
		const symbolElement = <sup className="stats-pricing-grid__price-symbol">{ symbol }</sup>;
		return (
			<p className="stats-pricing-grid__price">
				{ symbolPosition === 'before' && symbolElement }
				{ integer }
				{ showPriceFraction && (
					<sup className="stats-pricing-grid__price-fraction">
						<strong>{ fraction }</strong>
					</sup>
				) }
				{ symbolPosition === 'after' && symbolElement }
			</p>
		);
	};

	const renderItem = ( feature: Feature, plan: 'paid' | 'free' ) => {
		const { isIncluded, label, strong } = feature[ plan ];
		const defaultLabel = isLg
			? String( isIncluded ? translate( 'Included' ) : translate( 'Not included' ) )
			: String(
					isIncluded
						? feature.name
						: translate( '%s not included', { args: [ feature.name ], comment: 'Feature name' } )
			  );
		const text = label ?? defaultLabel;
		return (
			<div
				className="stats-pricing-grid__item stats-pricing-grid__item--value"
				key={ feature.name }
			>
				<Icon
					className={ clsx(
						'stats-pricing-grid__item-icon',
						isIncluded
							? 'stats-pricing-grid__item-icon--check'
							: 'stats-pricing-grid__item-icon--cross'
					) }
					size={ 32 }
					icon={ isIncluded ? check : closeSmall }
				/>
				<span className="stats-pricing-grid__item-text">
					{ strong ? <strong>{ text }</strong> : text }
				</span>
			</div>
		);
	};

	const renderHeader = ( children: React.ReactNode ) => (
		<div className="stats-pricing-grid__header-container">
			<div className="stats-pricing-grid__header">{ children }</div>
		</div>
	);

	// Prices are yearly; shown per month like the Search grid. The layout renders
	// with the price block omitted if the product hasn't loaded — CTAs still work.
	const monthlyPrice = product?.cost ? product.cost / 12 : null;
	const currencyCode = product?.currency_code ?? 'USD';

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<div className="stats stats-pricing-grid">
				<div className="stats-pricing-grid__container">
					<div
						className={ clsx( 'stats-pricing-grid__pricing-table', {
							'is-viewport-large': isLg,
						} ) }
						style={
							{
								'--rows': features.length + 1,
								'--columns': 3,
							} as React.CSSProperties
						}
					>
						<div className="stats-pricing-grid__table">
							<div>
								<h2 className="stats-pricing-grid__table-title">
									{ translate( 'Choose your Stats plan' ) }
								</h2>
							</div>
							{ isLg &&
								features.map( ( feature, i ) => (
									<div
										className={ clsx(
											'stats-pricing-grid__item',
											'stats-pricing-grid__item--feature',
											{
												'stats-pricing-grid__item--last-feature': i === features.length - 1,
											}
										) }
										key={ feature.name }
									>
										<span className="stats-pricing-grid__item-text">
											<strong>{ feature.name }</strong>
										</span>
									</div>
								) ) }

							{ /* Paid column */ }
							<div className="stats-pricing-grid__card stats-pricing-grid__card--primary">
								{ renderHeader(
									<>
										<div className="stats-pricing-grid__price-row">
											{ monthlyPrice !== null && renderPrice( monthlyPrice, currencyCode, false ) }
										</div>
										<div className="stats-pricing-grid__price-legend">
											{ translate( 'per month, from 10k monthly views, billed yearly' ) }
										</div>
										<Button
											className="stats-pricing-grid__cta"
											variant="primary"
											onClick={ goToPurchase }
										>
											{ paidLabel }
										</Button>
									</>
								) }
								{ features.map( ( feature ) => renderItem( feature, 'paid' ) ) }
							</div>

							{ /* Free column */ }
							<div className="stats-pricing-grid__card">
								{ renderHeader(
									<>
										<div className="stats-pricing-grid__price-row">
											{ renderPrice( 0, currencyCode, true ) }
										</div>
										{ /* The legend's ::after zero-width space keeps the row height. */ }
										<div className="stats-pricing-grid__price-legend" />
										<Button
											className="stats-pricing-grid__cta"
											variant="secondary"
											onClick={ startForFree }
										>
											{ freeLabel }
										</Button>
									</>
								) }
								{ features.map( ( feature ) => renderItem( feature, 'free' ) ) }
							</div>
						</div>
					</div>

					<div className="stats-pricing-grid__tos-container">
						<div className="stats-pricing-grid__tos">
							{ createInterpolateElement(
								String(
									translate(
										'By clicking <strong>%(paid)s</strong> or <strong>%(free)s</strong>, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site’s data</shareDetailsLink> with us.',
										{ args: { paid: paidLabel, free: freeLabel } }
									)
								),
								{
									strong: <strong />,
									tosLink: (
										<ExternalLink
											href="https://jetpack.com/redirect/?source=wpcom-tos"
											children={ null }
										/>
									),
									shareDetailsLink: (
										<ExternalLink
											href="https://jetpack.com/redirect/?source=jetpack-support-what-data-does-jetpack-sync"
											children={ null }
										/>
									),
								}
							) }
						</div>
					</div>
				</div>
			</div>
		</Main>
	);
}
