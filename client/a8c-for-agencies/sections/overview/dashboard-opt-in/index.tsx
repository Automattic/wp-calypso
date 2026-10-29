/**
 * The classic dashboard's side of the opt-in flow: the invitation on Overview, the
 * profile-menu entry, and the notes after "Not now" and after switching back.
 * Driven by the development-only opt-in preview; nothing here saves a preference.
 */
import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import newDashboardDrawing from 'calypso/dashboard/agency/dashboard-preference/images/new-dashboard.svg';
// eslint-disable-next-line no-restricted-imports -- reuses the new dashboard's tour glow as is.
import glow from 'calypso/dashboard/agency/onboarding-tour/images/tour/glow.jpg';
import {
	OPT_IN_STEPS,
	previewUrl,
	setOptInPreview,
	useOptInPreview,
} from 'calypso/dashboard/agency/opt-in-preview/store';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import type { OptInPreviewState } from 'calypso/dashboard/agency/opt-in-preview/store';

import './style.scss';

const ARRIVAL = OPT_IN_STEPS.find( ( step ) => step.id === 'arrival' )!;

export function newDashboardUrl( preview: OptInPreviewState, path = ARRIVAL.path ) {
	return previewUrl( 'dashboard', path, { ...ARRIVAL.state, role: preview.role } );
}

/**
 * Who can switch, and whether the invitation applies: owners of agencies on classic.
 */
export function useDashboardOptIn() {
	const preview = useOptInPreview();
	return {
		preview,
		canSwitch: !! preview && preview.role === 'owner' && preview.agency === 'not-opted-in',
	};
}

export function DashboardOptInModal( {
	preview,
	onClose,
}: {
	preview: OptInPreviewState;
	onClose: () => void;
} ) {
	const translate = useTranslate();
	const onNotNow = () => {
		onClose();
		setOptInPreview( { firstVisit: false, overlay: 'not-now' } );
	};
	return (
		<Modal
			className="a4a-dashboard-opt-in-intro"
			size="medium"
			onRequestClose={ onNotNow }
			__experimentalHideHeader
		>
			<div
				className="a4a-dashboard-opt-in-intro-field"
				style={ { backgroundImage: `url(${ glow })` } }
			>
				<img className="a4a-dashboard-opt-in-intro-drawing" src={ newDashboardDrawing } alt="" />
			</div>
			<VStack spacing={ 8 }>
				<VStack spacing={ 2 }>
					<Heading level={ 2 } size={ 20 } weight={ 600 }>
						{ translate( 'Try the new dashboard' ) }
					</Heading>
					<Text>
						{ translate(
							'Manage your sites, purchases, and earnings in one place. Your whole team moves with you, and you can switch back at any time from Agency > Dashboard.'
						) }
					</Text>
				</VStack>
				<HStack justify="flex-end" spacing={ 3 }>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onNotNow }>
						{ translate( 'Not now' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" href={ newDashboardUrl( preview ) }>
						{ translate( 'Switch to the new dashboard' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}

function useOverlayNotice( preview: OptInPreviewState | null ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const overlay = preview?.overlay;
	const isOwner = preview?.role === 'owner';
	useEffect( () => {
		let message: string | null = null;
		if ( overlay === 'not-now' && isOwner ) {
			message = translate( 'You can switch any time from the menu under your profile picture.' );
		}
		if ( overlay === 'back' ) {
			message = isOwner
				? translate(
						'You’re back on the previous dashboard. You can try the new one again from the menu under your profile picture.'
					)
				: translate( 'Your agency is back on the previous dashboard.' );
		}
		if ( message ) {
			dispatch( successNotice( message, { id: 'a4a-dashboard-opt-in-note', duration: 10000 } ) );
		}
	}, [ dispatch, translate, overlay, isOwner ] );
}

export default function DashboardOptIn() {
	const { preview, canSwitch } = useDashboardOptIn();
	const [ isClosed, setIsClosed ] = useState( false );
	useOverlayNotice( preview );

	// Classic forwards an opted-in agency to the matching page in the new dashboard.
	useEffect( () => {
		if ( preview?.agency === 'opted-in' ) {
			window.location.replace( newDashboardUrl( preview ) );
		}
	}, [ preview ] );

	if ( ! preview || ! canSwitch || ! preview.firstVisit || isClosed ) {
		return null;
	}
	return <DashboardOptInModal preview={ preview } onClose={ () => setIsClosed( true ) } />;
}

/**
 * Amplify and Reports stay in classic. While the agency uses the new dashboard, this leads back.
 */
export function NewDashboardNote() {
	const translate = useTranslate();
	const preview = useOptInPreview();
	const [ isClosed, setIsClosed ] = useState( false );
	if ( ! preview || preview.agency !== 'opted-in' || isClosed ) {
		return null;
	}
	return (
		<LayoutBanner
			isFullWidth
			level="info"
			title={ translate( 'Amplify stays here for now' ) as string }
			className="a4a-dashboard-opt-in-note"
			onClose={ () => setIsClosed( true ) }
		>
			<div>{ translate( 'Your agency uses the new dashboard for everything else.' ) }</div>
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
				{ translate( 'Go to the new dashboard' ) }
			</Button>
		</LayoutBanner>
	);
}
