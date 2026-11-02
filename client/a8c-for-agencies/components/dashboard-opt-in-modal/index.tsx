import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import useDashboardOptIn from 'calypso/a8c-for-agencies/hooks/use-dashboard-opt-in';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import newDashboardDrawing from './images/new-dashboard.svg';

import './style.scss';

const HASH = '#switch-dashboard';
const LINK_SOURCES = [ 'helpful-links', 'profile-menu' ] as const;
type LinkSource = ( typeof LINK_SOURCES )[ number ];

type Props = {
	onClose: () => void;
	// Where the modal was opened from, for Tracks.
	source: 'overview' | LinkSource;
};

/**
 * A link that opens the modal from anywhere in this app, like the contact support form.
 */
export function getDashboardOptInLink( source: LinkSource ) {
	return `${ HASH }-${ source }`;
}

function getLinkSource(): LinkSource | null {
	return (
		LINK_SOURCES.find( ( source ) => window.location.hash === getDashboardOptInLink( source ) ) ??
		null
	);
}

/**
 * Shows the modal while the URL has a link from `getDashboardOptInLink`.
 */
export function DashboardOptInLinkModal() {
	const { canOptIn } = useDashboardOptIn();
	const [ source, setSource ] = useState( getLinkSource );

	useEffect( () => {
		const update = () => setSource( getLinkSource() );
		window.addEventListener( 'hashchange', update );
		return () => window.removeEventListener( 'hashchange', update );
	}, [] );

	if ( ! canOptIn || ! source ) {
		return null;
	}

	return (
		<DashboardOptInModal
			source={ source }
			onClose={ () => {
				history.replaceState( null, '', window.location.pathname + window.location.search );
				setSource( null );
			} }
		/>
	);
}

/**
 * Introduces the new dashboard and moves the agency there in one step.
 */
export default function DashboardOptInModal( { onClose, source }: Props ) {
	const dispatch = useDispatch();
	const { optIn, isPending } = useDashboardOptIn();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dashboard_opt_in_modal_view', { source } ) );
	}, [ dispatch, source ] );

	const handleNotNow = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dashboard_opt_in_modal_dismiss', { source } ) );
		onClose();
	};

	const handleConfirm = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_dashboard_opt_in_modal_confirm', { source } ) );
		optIn();
	};

	return (
		<Modal
			className="a4a-dashboard-opt-in-modal"
			onRequestClose={ isPending ? () => {} : handleNotNow }
			__experimentalHideHeader
		>
			<VStack className="a4a-dashboard-opt-in-modal-content" spacing={ 8 }>
				<img className="a4a-dashboard-opt-in-modal-drawing" src={ newDashboardDrawing } alt="" />
				<VStack spacing={ 2 }>
					<Heading level={ 2 } size={ 20 } weight={ 600 }>
						{ __( 'Try the new dashboard' ) }
					</Heading>
					<Text>
						{ __(
							'Manage your sites, purchases, and earnings in one place. Your whole team moves with you, and you can switch back at any time from Agency > Dashboard.'
						) }
					</Text>
				</VStack>
				<HStack justify="flex-end" spacing={ 3 }>
					<Button
						variant="tertiary"
						onClick={ handleNotNow }
						disabled={ isPending }
						__next40pxDefaultSize
					>
						{ __( 'Not now' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleConfirm }
						isBusy={ isPending }
						disabled={ isPending }
						__next40pxDefaultSize
					>
						{ __( 'Switch to the new dashboard' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
