import { __ } from '@wordpress/i18n';
import { image, page } from '@wordpress/icons';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';

import './style.scss';

export default function AgentStudioOverviewContent() {
	return (
		<>
			<div className="a4a-agent-studio-overview__heading">
				{ __( 'Agent studio is coming soon' ) }
			</div>
			<div className="a4a-agent-studio-overview__subtitle">
				{ __(
					'Create client-ready materials from a brief and the brand details saved with each project.'
				) }
			</div>
			<StepSection heading={ __( 'Tools' ) }>
				<StepSectionItem
					icon={ page }
					heading={ __( 'Ela' ) }
					description={ __( 'One-pager designer for client-ready project materials.' ) }
					buttonProps={ {
						children: __( 'Coming soon' ),
						disabled: true,
						compact: true,
					} }
				/>
				<StepSectionItem
					icon={ image }
					heading={ __( 'Bea' ) }
					description={ __( 'Social media asset designer for posts that need visuals.' ) }
					buttonProps={ {
						children: __( 'Coming soon' ),
						disabled: true,
						compact: true,
					} }
				/>
			</StepSection>
		</>
	);
}
