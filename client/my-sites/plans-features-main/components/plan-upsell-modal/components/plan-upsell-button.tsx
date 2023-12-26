import { useTranslate } from 'i18n-calypso';
import PlanButton from 'calypso/my-sites/plans-grid/components/plan-button';
import type { PlanUpsellInfo } from '../hooks/use-plan-upsell-info';
import type { PlanSlug } from '@automattic/calypso-products';

function PlanUpsellButton( {
	planUpsellInfo,
	onPlanSelected,
	disabled = false,
	isBusy = false,
}: {
	planUpsellInfo: PlanUpsellInfo;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	disabled?: boolean;
	isBusy?: boolean;
} ) {
	const translate = useTranslate();

	return (
		<PlanButton
			planSlug={ planUpsellInfo.planSlug }
			disabled={ disabled }
			busy={ isBusy }
			onClick={ () => {
				onPlanSelected( planUpsellInfo.planSlug );
			} }
		>
			{ translate( 'Get %(planTitle)s - %(planPrice)s/month', {
				comment: 'Eg: Get Personal $4/month',
				args: {
					planTitle: planUpsellInfo.title,
					planPrice: planUpsellInfo.formattedPriceMonthly,
				},
			} ) }
		</PlanButton>
	);
}

export default PlanUpsellButton;
