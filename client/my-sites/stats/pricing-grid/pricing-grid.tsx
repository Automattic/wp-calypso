import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { ProductsList } from '@automattic/data-stores';
import { getCurrencyObject } from '@automattic/number-formatters';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ExternalLink } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Notices } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import './style.scss';

const TRACKS_REFERRER = 'jetpack-stats-pricing-grid';

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
	const queryClient = useQueryClient();
	const { mutate: recordDismissal } = useNoticeVisibilityMutation(
		siteId,
		'pricing_grid',
		'dismissed'
	);

	const product = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	) as ProductsList.RawAPIProduct | null;

	const includedLabel = String( translate( 'Included' ) );
	// The four paid differentiators lead; everything below them is shared by both plans.
	const features: Feature[] = [
		{
			name: String( translate( 'UTM tracking' ) ),
			paid: { isIncluded: true, label: includedLabel, strong: true },
			free: { isIncluded: false },
		},
		{
			name: String( translate( 'Device stats' ) ),
			paid: { isIncluded: true, label: includedLabel, strong: true },
			free: { isIncluded: false },
		},
		{
			name: String( translate( 'Locations' ) ),
			paid: { isIncluded: true, label: String( translate( 'Region and city' ) ), strong: true },
			free: { isIncluded: true, label: String( translate( 'Country-level' ) ) },
		},
		{
			name: String( translate( 'Priority support' ) ),
			paid: { isIncluded: true, label: includedLabel, strong: true },
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

	const dismiss = () => {
		recordDismissal();
		// The mutation doesn't touch the notices query cache, so update it in place:
		// the gate re-reads it on SPA route changes (e.g. returning from the purchase
		// page via "I will do it later") and must see the grid as already dismissed.
		queryClient.setQueryData(
			[ 'stats', 'notices-visibility', 'raw', siteId ],
			( notices: Notices | undefined ) => notices && { ...notices, pricing_grid: false }
		);
		onDismiss?.();
	};

	// Navigate programmatically rather than via href: the wp-admin shim intercepts
	// anchor clicks inside #wpcom with a jQuery handler registered before React
	// mounts, so an onClick on a link Button never runs and the dismissal is lost.
	const goToPurchase = () => {
		dismiss();
		page( `/stats/purchase/${ siteSlug }?from=${ TRACKS_REFERRER }` );
	};

	const renderPrice = ( value: number, currency: string, hidePriceFraction: boolean ) => {
		const { symbol, integer, fraction } = getCurrencyObject( value, currency );
		const showPriceFraction = ! hidePriceFraction || ! fraction.endsWith( '00' );
		return (
			<p className="stats-pricing-grid__price">
				<sup className="stats-pricing-grid__price-symbol">{ symbol }</sup>
				{ integer }
				{ showPriceFraction && (
					<sup className="stats-pricing-grid__price-fraction">
						<strong>{ fraction }</strong>
					</sup>
				) }
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
											onClick={ dismiss }
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
										'By clicking <strong>%(paid)s</strong> or <strong>%(free)s</strong>, you agree to our <tosLink>Terms of Service</tosLink> and to <shareDetailsLink>sync your site‘s data</shareDetailsLink> with us.',
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
