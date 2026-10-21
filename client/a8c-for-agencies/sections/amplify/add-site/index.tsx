import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AmplifyAddSiteModal from './modal';

export default function AmplifyAddSite( { className }: { className?: string } = {} ) {
	const dispatch = useDispatch();
	const [ isOpen, setIsOpen ] = useState( false );

	const handleOpen = useCallback( () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_a4a_amplify_add_site_button_click' ) );
	}, [ dispatch ] );

	return (
		<>
			<Button
				__next40pxDefaultSize
				variant="primary"
				className={ className }
				onClick={ handleOpen }
			>
				{ __( 'Amplify a site' ) }
			</Button>
			{ isOpen && <AmplifyAddSiteModal onClose={ () => setIsOpen( false ) } /> }
		</>
	);
}
