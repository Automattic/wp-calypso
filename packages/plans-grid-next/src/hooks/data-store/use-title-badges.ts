import { isWooHostedBasicPlan, type PlanSlug } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import type { PlansIntent } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	intent?: PlansIntent;
	planSlugs: PlanSlug[];
}

const useTitleBadges = ( { intent, planSlugs }: Props ) => {
	const translate = useTranslate();

	return planSlugs.reduce(
		( acc, planSlug ) => {
			let label;

			if ( 'plans-woo-hosted' === intent && isWooHostedBasicPlan( planSlug ) ) {
				label = translate( 'Recommended' );
			}

			return {
				...acc,
				[ planSlug ]: label ?? null,
			};
		},
		{} as Record< PlanSlug, TranslateResult | null >
	);
};

export default useTitleBadges;
