import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { isOnNewAgencyDashboard } from 'calypso/dashboard/agency/lib/dashboard-opt-in';
import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Amplify stays here while the agency uses the new dashboard for everything else, so this
 * leads back there.
 */
export default function NewDashboardNote() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const [ isClosed, setIsClosed ] = useState( false );

	if ( ! isOnNewAgencyDashboard( agency ) || isClosed ) {
		return null;
	}

	return (
		<LayoutBanner
			isFullWidth
			level="info"
			title={ __( 'Amplify stays here for now' ) }
			onClose={ () => {
				dispatch( recordTracksEvent( 'calypso_a4a_amplify_new_dashboard_note_dismiss' ) );
				setIsClosed( true );
			} }
		>
			<VStack spacing={ 4 } alignment="flex-start">
				<Text>{ __( 'Your agency uses the new dashboard for everything else.' ) }</Text>
				<Button
					variant="primary"
					href={ buildDashboardLink( 'a4a', '/overview' ) }
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_a4a_amplify_new_dashboard_note_click' ) )
					}
					__next40pxDefaultSize
				>
					{ __( 'Go to the new dashboard' ) }
				</Button>
			</VStack>
		</LayoutBanner>
	);
}
