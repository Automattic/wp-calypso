import { useEvent } from '@wordpress/compose';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import SiteLaunchModal from '.';
import type { Site } from '@automattic/api-core';

interface SiteLaunchCelebrationModalProps {
	site: Pick< Site, 'ID' | 'slug' | 'URL' | 'launch_status' > & {
		plan?: Pick< Required< Site >[ 'plan' ], 'is_free' | 'product_slug' >;
	};
	onOpen?(): void;
	onClose?(): void;
}

export default function SiteLaunchCelebrationModal( {
	site,
	onOpen: externalOnOpen,
	onClose,
}: SiteLaunchCelebrationModalProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();

	const onOpen = useEvent( () => {
		externalOnOpen?.();
		setIsOpen( true );

		// Track the modal view
		recordTracksEvent( 'calypso_launchpad_celebration_modal_view', {
			product_slug: site?.plan?.product_slug,
		} );
	} );

	// Check if celebration modal should be shown based on URL param and site launch status
	useEffect( () => {
		const hasCelebrateLaunch = new URLSearchParams( window.location.search ).has(
			'celebrateLaunch'
		);
		const isSiteLaunched = site.launch_status === 'launched' || site.launch_status === false;

		if ( isSiteLaunched && hasCelebrateLaunch ) {
			onOpen();
		}
	}, [ site.launch_status, onOpen ] );

	const handleClose = () => {
		setIsOpen( false );
		onClose?.();

		// Remove the celebrateLaunch URL param without reloading the page
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.href, 'celebrateLaunch' )
		);
	};

	return (
		<SiteLaunchModal
			variant="celebration"
			site={ site }
			isOpen={ isOpen }
			onClose={ handleClose }
		/>
	);
}
