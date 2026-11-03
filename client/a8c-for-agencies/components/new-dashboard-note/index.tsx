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

type NoteProduct = 'amplify' | 'reports';

// Full sentences per product, so each translates on its own.
function getNoteTitle( product: NoteProduct ) {
	return product === 'reports'
		? __( 'Reports is still in the classic dashboard' )
		: __( 'Amplify is still in the classic dashboard' );
}

/**
 * Amplify and Reports stay here while the agency uses the new dashboard for everything
 * else, so this leads back there.
 */
export default function NewDashboardNote( { product = 'amplify' }: { product?: NoteProduct } ) {
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
			title={ getNoteTitle( product ) }
			onClose={ () => {
				dispatch( recordTracksEvent( `calypso_a4a_${ product }_new_dashboard_note_dismiss` ) );
				setIsClosed( true );
			} }
		>
			<VStack spacing={ 4 } alignment="flex-start">
				<Text>{ __( 'Everything else for your agency is in the new dashboard.' ) }</Text>
				<Button
					variant="primary"
					href={ buildDashboardLink( 'a4a', '/overview' ) }
					onClick={ () =>
						dispatch( recordTracksEvent( `calypso_a4a_${ product }_new_dashboard_note_click` ) )
					}
					__next40pxDefaultSize
				>
					{ __( 'Back to the new dashboard' ) }
				</Button>
			</VStack>
		</LayoutBanner>
	);
}
