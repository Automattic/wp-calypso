import {
	getPlanClass,
	isEcommercePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { WooLogo } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ActionButton from '../shared/action-button';
import ClientLogoList from './client-logo-list';
import type { GridPlan, PlanActionOverrides } from '../../types';

const ENTERPRISE_BOTTOM_CARD_LOGO_SLUGS = [
	'slack',
	'usa-today',
	'salesforce',
	'meta',
	'intuit',
	'capgemini',
	'news-corp',
	'samsung',
	'nasa',
];

type BottomPlanCardProps = {
	currentSitePlanSlug?: string | null;
	gridPlan: GridPlan;
	isInSignup: boolean;
	planActionOverrides?: PlanActionOverrides;
};

const BottomPlanCard = ( {
	currentSitePlanSlug,
	gridPlan,
	isInSignup,
	planActionOverrides,
}: BottomPlanCardProps ) => {
	const translate = useTranslate();
	const isEnterprise = isWpcomEnterpriseGridPlan( gridPlan.planSlug );
	const isWooCommerce = isEcommercePlan( gridPlan.planSlug );

	return (
		<div
			className={ clsx(
				'plans-grid-next-features-grid__bottom-plan-card',
				getPlanClass( gridPlan.planSlug ),
				{
					'is-enterprise-bottom-card': isEnterprise,
					'is-woocommerce-bottom-card': isWooCommerce,
				}
			) }
		>
			<div className="plans-grid-next-features-grid__bottom-plan-card-copy">
				<h4 className="plans-grid-next-features-grid__bottom-plan-card-title">
					{ gridPlan.planTitle }
				</h4>
				<p className="plans-grid-next-features-grid__bottom-plan-card-tagline">
					{ gridPlan.tagline }
				</p>
				<div className="plans-grid-next-features-grid__bottom-plan-card-action">
					<ActionButton
						availableForPurchase={ gridPlan.availableForPurchase }
						currentSitePlanSlug={ currentSitePlanSlug }
						isInSignup={ isInSignup }
						isMonthlyPlan={ gridPlan.isMonthlyPlan }
						isStuck={ false }
						planActionOverrides={ planActionOverrides }
						planSlug={ gridPlan.planSlug }
						showMonthlyPrice
						showPostButtonText={ false }
						visibleGridPlans={ [ gridPlan ] }
					/>
				</div>
			</div>
			<div
				className="plans-grid-next-features-grid__bottom-plan-card-media"
				aria-label={
					isEnterprise ? translate( 'Enterprise customer logos' ).toString() : undefined
				}
			>
				{ isEnterprise && <ClientLogoList slugs={ ENTERPRISE_BOTTOM_CARD_LOGO_SLUGS } /> }
				{ isWooCommerce && (
					<WooLogo className="plans-grid-next-features-grid__bottom-plan-card-woo-logo" />
				) }
			</div>
		</div>
	);
};

export default BottomPlanCard;
