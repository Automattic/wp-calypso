import { Icon, info } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import A4APopoverTrigger from 'calypso/a8c-for-agencies/components/a4a-popover/trigger';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import PressableUsageDetails from 'calypso/a8c-for-agencies/components/pressable-usage-details';
import { getPressablePlanRenameNote } from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan-former-name';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct;
};

function RenamedPlanNote( { formerName }: { formerName: string } ) {
	const translate = useTranslate();
	const [ iconNode, setIconNode ] = useState< HTMLSpanElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );

	return (
		<>
			<A4APopoverTrigger
				className="pressable-usage-card__rename-info"
				aria-label={ translate( 'About your plan name' ) }
				ref={ setIconNode }
				onActivate={ () => setShowPopover( true ) }
			>
				<Icon icon={ info } size={ 20 } />
			</A4APopoverTrigger>
			{ showPopover && (
				<A4APopover
					title=""
					offset={ 12 }
					anchor={ iconNode }
					focusOnMount
					onFocusOutside={ () => setShowPopover( false ) }
				>
					<div className="a4a-popover__title">
						{ translate( 'Formerly %(formerName)s', {
							args: { formerName },
							comment:
								'%(formerName)s is the previous name of the plan, e.g. Pressable Signature 2.',
						} ) }
					</div>
					{ translate( 'Your price, features, sites, visits, and storage haven’t changed.' ) }
				</A4APopover>
			) }
		</>
	);
}

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
					<span className="pressable-usage-card__name">
						{ existingPlan.name }
						{ formerName && <RenamedPlanNote formerName={ formerName } /> }
					</span>
					<Badge intent="draft">{ translate( 'Plan' ) }</Badge>
				</div>
				<PressableUsageDetails existingPlan={ existingPlan } />
			</div>
		</PageSection>
	);
}
