import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import PressableUsageDetails from 'calypso/a8c-for-agencies/components/pressable-usage-details';
import { getPressablePlanRenameNote } from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan-former-name';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct;
};

// Shared with the MSD so a dismissal carries over.
const RENAME_NOTICE_DISMISS_PREFERENCE = 'a4a-pressable-plan-rename-notice-dismissed';

export default function PressableUsageSection( { existingPlan }: Props ) {
	const translate = useTranslate();
	const formerName = getPressablePlanRenameNote( existingPlan );

	return (
		<PageSection
			className="pressable-usage-section"
			heading={ translate( 'Your current Pressable plan' ) }
		>
			<div className="pressable-usage-card">
				<div className="pressable-usage-card__heading">
					{ existingPlan.name } <Badge intent="draft">{ translate( 'Plan' ) }</Badge>
				</div>
				{ formerName && (
					<LayoutBanner
						className="pressable-usage-card__rename-notice"
						level="info"
						title={ translate( 'Your plan has a new name' ) }
						preferenceName={ RENAME_NOTICE_DISMISS_PREFERENCE }
					>
						{ translate(
							'%(formerName)s is now %(name)s. Your price, features, sites, visits, and storage haven’t changed.',
							{
								args: { formerName, name: existingPlan.name },
								comment:
									'%(formerName)s is the previous plan name, e.g. Pressable Signature 2. %(name)s is the current plan name, e.g. Pressable Standard 3.',
							}
						) }
					</LayoutBanner>
				) }
				<PressableUsageDetails existingPlan={ existingPlan } />
			</div>
		</PageSection>
	);
}
