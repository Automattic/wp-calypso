import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
} from '@automattic/calypso-products';
import { JetpackLogo } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PricingMetaForGridPlan } from '@automattic/data-stores';
import type { ReactNode } from 'react';

export const MigrationPlanFeatureList = ( {
	planSlug,
	fullMonthlyPrice,
	pricing,
}: {
	planSlug: PlanSlug;
	fullMonthlyPrice?: number | null;
	pricing?: PricingMetaForGridPlan;
} ) => {
	const translate = useTranslate();
	if ( ! pricing || ! fullMonthlyPrice ) {
		return null;
	}

	const selectedPlanPricing = pricing.originalPrice?.monthly;
	const selectedPlanDiscountedPrice = pricing.introOffer?.rawPrice?.monthly;

	const annualSavingsDecimal =
		fullMonthlyPrice && selectedPlanPricing
			? ( fullMonthlyPrice - selectedPlanPricing ) / fullMonthlyPrice
			: 0;

	const discountedPriceDecimal =
		selectedPlanPricing && selectedPlanDiscountedPrice
			? ( selectedPlanPricing - selectedPlanDiscountedPrice ) / selectedPlanPricing
			: 0;

	const jetpackFeatures = [
		translate( 'In-depth site analytics dashboard' ),
		translate( 'SEO, marketing, and analytics tools' ),
		translate( 'Plugin auto-updates' ),
		translate( 'Real-time backups and one-click restores' ),
	];

	const businessFeatures = [
		translate( 'Unrestricted bandwidth and visitors' ),
		translate( 'Install plugins and themes' ),
		translate( 'SFTP/SSH, WP-CLI, Git tools' ),
	];

	const commonDiscountedFeatures = [
		// translators: %(percentage)s is the percentage of annual savings formatted like '50%'
		translate( '{{strong}}%(percentage)s{{/strong}} annual savings', {
			args: {
				percentage: formatNumber( annualSavingsDecimal, {
					numberFormatOptions: { style: 'percent' },
				} ),
			},
			components: { strong: <strong /> },
		} ),
		translate( '{{strong}}Free{{/strong}} domain for a year', {
			components: { strong: <strong /> },
		} ),
		translate( '{{strong}}Free{{/strong}} migration service', {
			components: { strong: <strong /> },
		} ),
		translate( 'Refundable within {{strong}}14 days{{/strong}}', {
			components: { strong: <strong /> },
		} ),
	];

	const migrationPlanFeatures: {
		wpcomFeatures: Partial< Record< PlanSlug, ReactNode[] > >;
		jetpackFeatures: ReactNode[];
	} = {
		wpcomFeatures: {
			[ PLAN_BUSINESS ]: [
				discountedPriceDecimal
					? translate( '{{strong}}%(percentage)s off{{/strong}} your first year', {
							args: {
								percentage: formatNumber( discountedPriceDecimal, {
									numberFormatOptions: { style: 'percent' },
								} ),
								comment: 'percentage like 50% off',
							},
							components: { strong: <strong /> },
					  } )
					: translate( 'No first year discount' ),
				...commonDiscountedFeatures,
				...businessFeatures,
			],
			[ PLAN_BUSINESS_MONTHLY ]: [
				translate( 'No first year discount' ),
				translate( 'No annual savings' ),
				translate( 'No free domain' ),
				translate( '{{strong}}Free{{/strong}} migration service', {
					components: { strong: <strong /> },
				} ),
				translate( 'Refundable within {{strong}}7 days{{/strong}}', {
					components: { strong: <strong /> },
				} ),
				...businessFeatures,
			],
			[ PLAN_BUSINESS_2_YEARS ]: [
				discountedPriceDecimal
					? translate( '{{strong}}%(percentage)s off{{/strong}} your first two years', {
							args: {
								percentage: formatNumber( discountedPriceDecimal, {
									numberFormatOptions: { style: 'percent' },
								} ),
								comment: 'percentage like 50% off',
							},
							components: { strong: <strong /> },
					  } )
					: translate( 'No discount on your first two years' ),
				...commonDiscountedFeatures,
				...businessFeatures,
			],
		},
		jetpackFeatures: [ ...jetpackFeatures ],
	};
	return (
		<ul className="import__details-list">
			{ migrationPlanFeatures[ 'wpcomFeatures' ][ planSlug ]?.map(
				( feature: ReactNode, index: number ) => (
					<li key={ index } className="import__upgrade-plan-feature">
						{ feature }
					</li>
				)
			) }
			<li className="import__upgrade-plan-feature logo">
				<JetpackLogo size={ 24 } />
			</li>
			{ migrationPlanFeatures[ 'jetpackFeatures' ].map( ( feature: ReactNode, index: number ) => (
				<li key={ index } className="import__upgrade-plan-feature">
					{ feature }
				</li>
			) ) }
		</ul>
	);
};
