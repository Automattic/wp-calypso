import { Button } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../component-view-tracker';
import { upsell } from '../icons';
import type { ComponentProps } from 'react';

import './style.scss';

type UpsellCTAButtonProps = ComponentProps< typeof Button > & {
	/**
	 * A unique ID for the upsell. Should also indicate the location where the upsell is being shown.
	 * Example: `site-overview-claim-this-domain`
	 */
	upsellId: string;

	/**
	 * The feature that is being upsold. Multiple upsells which upsell the same feature should have the same `upsellFeatureId`.
	 * Example: `domain`
	 */
	upsellFeatureId?: string;

	onClick?: ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => void;
};

export default function UpsellCTAButton( props: UpsellCTAButtonProps ) {
	const { upsellId, upsellFeatureId, onClick, ...buttonProps } = props;
	const { recordTracksEvent } = useAnalytics();

	const handleClick = ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', {
			upsell_id: upsellId,
			upsell_feature_id: upsellFeatureId,
		} );
		onClick?.( event );
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_impression"
				properties={ {
					upsell_id: upsellId,
					upsell_feature_id: upsellFeatureId,
				} }
			/>
			<Button
				className="dashboard-upsell-cta-button"
				onClick={ handleClick }
				{ ...( buttonProps.variant !== 'link' && { icon: upsell, size: 'compact' } ) }
				{ ...buttonProps }
			/>
		</>
	);
}
