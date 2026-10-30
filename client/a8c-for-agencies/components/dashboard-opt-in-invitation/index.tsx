import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import DashboardOptInModal from 'calypso/a8c-for-agencies/components/dashboard-opt-in-modal';
import useDashboardOptIn from 'calypso/a8c-for-agencies/hooks/use-dashboard-opt-in';
import OptInPreviewPanel from 'calypso/dashboard/agency/opt-in-preview';
import {
	OPT_IN_STEPS,
	previewUrl,
	setOptInPreview,
	useOptInPreview,
} from 'calypso/dashboard/agency/opt-in-preview/store';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';

const ARRIVAL = OPT_IN_STEPS.find( ( step ) => step.id === 'arrival' )!;
const OPEN_EVENT = 'a4a-dashboard-opt-in-open';

/**
 * Opens the invitation from anywhere on Overview, like the Helpful links entry.
 */
export function openDashboardOptIn() {
	window.dispatchEvent( new Event( OPEN_EVENT ) );
}

/**
 * The notes that say where to switch later: after "Not now", and after switching back.
 */
function useOptInNote() {
	const dispatch = useDispatch();
	const preview = useOptInPreview();
	const overlay = preview?.overlay;
	const isOwner = preview?.role === 'owner';
	useEffect( () => {
		let message: string | null = null;
		if ( overlay === 'not-now' && isOwner ) {
			message = __( 'You can switch any time from Helpful links on this page.' );
		}
		if ( overlay === 'back' ) {
			message = isOwner
				? __(
						'You’re back on the previous dashboard. You can try the new one again from Helpful links on this page.'
					)
				: __( 'Your agency is back on the previous dashboard.' );
		}
		if ( message ) {
			dispatch( successNotice( message, { id: 'a4a-dashboard-opt-in-note', duration: 10000 } ) );
		}
	}, [ dispatch, overlay, isOwner ] );
}

/**
 * The invitation on classic Overview: the modal on the owner's first visit, again from
 * Helpful links any time, and a forward to the new dashboard once the agency has switched.
 */
export default function DashboardOptInInvitation() {
	const preview = useOptInPreview();
	const { canOptIn } = useDashboardOptIn();
	const [ isClosed, setIsClosed ] = useState( false );
	const [ isReopened, setIsReopened ] = useState( false );
	useOptInNote();

	useEffect( () => {
		const reopen = () => setIsReopened( true );
		window.addEventListener( OPEN_EVENT, reopen );
		return () => window.removeEventListener( OPEN_EVENT, reopen );
	}, [] );

	// Classic forwards an opted-in agency to the matching page in the new dashboard.
	useEffect( () => {
		if ( preview?.agency === 'opted-in' ) {
			window.location.replace(
				previewUrl( 'dashboard', ARRIVAL.path, { ...ARRIVAL.state, role: preview.role } )
			);
		}
	}, [ preview ] );

	let modal = null;
	if ( preview && canOptIn && isReopened ) {
		modal = <DashboardOptInModal source="helpful-links" onClose={ () => setIsReopened( false ) } />;
	} else if ( preview && canOptIn && preview.firstVisit && ! isClosed ) {
		modal = (
			<DashboardOptInModal
				source="overview"
				onClose={ () => {
					setIsClosed( true );
					setOptInPreview( { firstVisit: false, overlay: 'not-now' } );
				} }
			/>
		);
	}
	return (
		<>
			{ modal }
			<OptInPreviewPanel />
		</>
	);
}
