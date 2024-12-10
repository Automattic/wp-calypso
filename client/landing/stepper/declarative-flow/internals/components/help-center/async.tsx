import { HelpCenter } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter = () => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	return (
		<AsyncLoad require="@automattic/help-center" placeholder={ null } handleClose={ handleClose } />
	);
};

export default AsyncHelpCenter;
