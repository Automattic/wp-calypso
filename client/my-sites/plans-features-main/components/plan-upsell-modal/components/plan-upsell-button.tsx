import { PlanButton } from '@automattic/plans-grid-next';
import { useTranslate } from 'i18n-calypso';
import { usePlanUpsellInfo } from '../hooks/use-plan-upsell-info';
import type { PlanSlug } from '@automattic/calypso-products';

function PlanUpsellButton( {
	planSlug,
	onPlanSelected,
	disabled = false,
	isBusy = false,
}: {
	planSlug: PlanSlug;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
	disabled?: boolean;
	isBusy?: boolean;
} ) {
	const translate = useTranslate();
	const planUpsellInfo = usePlanUpsellInfo( { planSlug } );

	return (
		<PlanButton
			planSlug={ planSlug }
			disabled={ disabled }
			busy={ isBusy }
			onClick={ () => {
				onPlanSelected( planSlug );
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
