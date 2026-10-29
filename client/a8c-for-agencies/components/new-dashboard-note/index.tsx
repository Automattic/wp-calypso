import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import {
	OPT_IN_STEPS,
	previewUrl,
	useOptInPreview,
} from 'calypso/dashboard/agency/opt-in-preview/store';

import './style.scss';

const ARRIVAL = OPT_IN_STEPS.find( ( step ) => step.id === 'arrival' )!;

/**
 * Amplify and Reports stay in classic. While the agency uses the new dashboard, this leads back.
 */
export default function NewDashboardNote() {
	const preview = useOptInPreview();
	const [ isClosed, setIsClosed ] = useState( false );
	if ( ! preview || preview.agency !== 'opted-in' || isClosed ) {
		return null;
	}
	return (
		<LayoutBanner
			isFullWidth
			level="info"
			title={ __( 'Amplify stays here for now' ) }
			className="a4a-dashboard-opt-in-note"
			onClose={ () => setIsClosed( true ) }
		>
			<div>{ __( 'Your agency uses the new dashboard for everything else.' ) }</div>
			<Button
				__next40pxDefaultSize
				className="a4a-dashboard-opt-in-note-button"
				variant="primary"
				href={ previewUrl( 'dashboard', '/overview', {
					...ARRIVAL.state,
					firstVisit: false,
					role: preview.role,
				} ) }
			>
				{ __( 'Go to the new dashboard' ) }
			</Button>
		</LayoutBanner>
	);
}
