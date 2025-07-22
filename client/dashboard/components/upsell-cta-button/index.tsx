import { Button } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../component-view-tracker';
import { upsell } from '../icons';
import type { ComponentProps } from 'react';

import './style.scss';

type UpsellCTAButtonProps = ComponentProps< typeof Button > & {
	tracksId: string;
	onClick?: ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => void;
};

export default function UpsellCTAButton( props: UpsellCTAButtonProps ) {
	const { tracksId, onClick, ...buttonProps } = props;
	const { recordTracksEvent } = useAnalytics();

	const handleClick = ( event: React.MouseEvent< HTMLButtonElement | HTMLAnchorElement > ) => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', {
			feature: tracksId,
			type: 'cta-button',
		} );
		onClick?.( event );
	};

	return (
		<>
			<ComponentViewTracker
				eventName="calypso_dashboard_upsell_impression"
				properties={ { feature: tracksId, type: 'cta-button' } }
			/>
			<Button
				className="dashboard-upsell-cta-button"
				icon={ upsell }
				onClick={ handleClick }
				size="compact"
				{ ...buttonProps }
			/>
		</>
	);
}
