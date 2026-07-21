import {
	getPlanClass,
	isEcommercePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { WooLogo } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ActionButton from '../shared/action-button';
import wooCommerceBottomCardProductImage from './assets/woocommerce-bottom-card-product.webp';
import wooCommerceBottomCardImage from './assets/woocommerce-bottom-card.webp';
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
	const title = isWooCommerce ? translate( 'Start selling with WooCommerce' ) : gridPlan.planTitle;
	const tagline = isWooCommerce
		? translate( 'For merchants growing an online store.' )
		: gridPlan.tagline;
	const buttonText = isWooCommerce ? translate( 'Get Commerce' ) : undefined;

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
				<h4 className="plans-grid-next-features-grid__bottom-plan-card-title">{ title }</h4>
				<p className="plans-grid-next-features-grid__bottom-plan-card-tagline">{ tagline }</p>
				<div className="plans-grid-next-features-grid__bottom-plan-card-action">
					<ActionButton
						availableForPurchase={ gridPlan.availableForPurchase }
						buttonText={ buttonText }
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
					<div className="plans-grid-next-features-grid__bottom-plan-card-woo-visual">
						<img
							alt=""
							className="plans-grid-next-features-grid__bottom-plan-card-woo-image"
							src={ wooCommerceBottomCardImage }
						/>
						<div className="plans-grid-next-features-grid__bottom-plan-card-woo-logo-badge">
							<WooLogo className="plans-grid-next-features-grid__bottom-plan-card-woo-logo" />
						</div>
						<div className="plans-grid-next-features-grid__bottom-plan-card-woo-product-card">
							<img
								alt=""
								className="plans-grid-next-features-grid__bottom-plan-card-woo-product-image"
								src={ wooCommerceBottomCardProductImage }
							/>
							<div className="plans-grid-next-features-grid__bottom-plan-card-woo-product-name">
								{ translate( 'Anna vase', {
									comment: 'Name of a sample product shown in the WooCommerce pricing card.',
								} ) }
							</div>
							<div className="plans-grid-next-features-grid__bottom-plan-card-woo-product-price">
								{ translate( '$55', {
									comment: 'Price of a sample product shown in the WooCommerce pricing card.',
								} ) }
							</div>
						</div>
					</div>
				) }
			</div>
		</div>
	);
};

export default BottomPlanCard;
