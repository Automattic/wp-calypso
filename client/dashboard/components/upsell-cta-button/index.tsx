import { Button } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../component-view-tracker';
import { upsell } from '../icons';
import type { ComponentProps } from 'react';

import './style.scss';

type UpsellCTAButtonProps = ComponentProps< typeof Button > & {
	trackId: string;
	onClick?: ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => void;
};

export default function UpsellCTAButton( props: UpsellCTAButtonProps ) {
	const { trackId, ...buttonProps } = props;
	const { recordTracksEvent } = useAnalytics();

	const handleClick = ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => {
		recordTracksEvent( 'calypso_dashboard_upsell_cta_button_click', { type: trackId } );
		buttonProps.onClick?.( event );
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_cta_button_impression"
				properties={ { type: trackId } }
			/>
			<Button
				className="dashboard-upsell-cta-button"
				icon={ upsell }
				onClick={ handleClick }
				{ ...buttonProps }
			/>
		</>
	);
}
