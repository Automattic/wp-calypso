import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import PressableUsageDetails from 'calypso/a8c-for-agencies/components/pressable-usage-details';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct;
};

export default function PressableUsageSection( { existingPlan }: Props ) {
	const translate = useTranslate();

	return (
		<PageSection
			className="pressable-usage-section"
			heading={ translate( 'Your current Pressable plan' ) }
		>
			<div className="pressable-usage-card">
				<div className="pressable-usage-card__heading">
					{ existingPlan.name } <Badge type="info">{ translate( 'Plan' ) }</Badge>
				</div>
				<PressableUsageDetails existingPlan={ existingPlan } />
			</div>
		</PageSection>
	);
}
