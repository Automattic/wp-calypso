import {
	isWpcomEnterpriseGridPlan,
	PlanSlug,
	isWooExpressPlan,
	isFreePlan,
} from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import usePlanBillingDescription from '../../../hooks/data-store/use-plan-billing-description';
import type { GridPlan } from '../../../types';

const DiscountPromotion = styled.div`
	text-transform: uppercase;
	font-weight: 600;
	color: #306e27;
	font-size: $font-body-extra-small;
	margin-top: 6px;
`;

interface RefundNoticeProps {
	showRefundPeriod?: boolean;
	planSlug: string;
	billingPeriod: GridPlan[ 'pricing' ][ 'billingPeriod' ];
}

const RefundNotice = ( { planSlug, showRefundPeriod, billingPeriod }: RefundNoticeProps ) => {
	const translate = useTranslate();

	if ( ! showRefundPeriod || isFreePlan( planSlug ) ) {
		return null;
	}

	return (
		<>
			<br />
			{ translate( 'Refundable within %(dayCount)s days. No questions asked.', {
				args: {
					dayCount: billingPeriod === 31 ? 7 : 14,
				},
			} ) }
		</>
	);
};

interface Props {
	planSlug: PlanSlug;
	showRefundPeriod?: boolean;
}

const BillingTimeframe = ( { showRefundPeriod, planSlug }: Props ) => {
	const translate = useTranslate();
	const { helpers, gridPlansIndex, coupon, siteId } = usePlansGridContext();
	const { isMonthlyPlan, billingTimeframe, pricing } = gridPlansIndex[ planSlug ];

	const { introOffer, billingPeriod } = pricing;
	const planBillingDescription = usePlanBillingDescription( {
		siteId,
		planSlug,
		pricing,
		isMonthlyPlan,
		coupon,
		useCheckPlanAvailabilityForPurchase: helpers?.useCheckPlanAvailabilityForPurchase,
	} );
	const description = planBillingDescription || billingTimeframe;

	if (
		isWooExpressPlan( planSlug ) &&
		isMonthlyPlan &&
		( ! introOffer || introOffer.isOfferComplete )
	) {
		return (
			<div>
				<div>{ billingTimeframe }</div>
				<DiscountPromotion>{ planBillingDescription }</DiscountPromotion>
			</div>
		);
	}

	if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
		const price = formatCurrency( 25000, 'USD' );

		return (
			<div className="plans-grid-next__billing-timeframe-vip-price">
				{ translate( 'Starts at {{b}}%(price)s{{/b}} yearly', {
					args: { price },
					components: { b: <b /> },
					comment: 'Translators: the price is in US dollars for all users (US$25,000)',
				} ) }
			</div>
		);
	}

	return (
		<div>
			{ description }
			<RefundNotice
				showRefundPeriod={ showRefundPeriod }
				planSlug={ planSlug }
				billingPeriod={ billingPeriod }
			/>
		</div>
	);
};

export default BillingTimeframe;
