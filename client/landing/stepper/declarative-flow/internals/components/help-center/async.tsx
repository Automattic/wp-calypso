import { HelpCenter } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useExperiment } from 'calypso/lib/explat';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter = () => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const [ isLoading, experimentAssignment ] = useExperiment(
		'calypso_helpcenter_new_support_flow'
	);

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	return (
		<AsyncLoad
			require="@automattic/help-center"
			placeholder={ null }
			handleClose={ handleClose }
			shouldUseHelpCenterExperience={
				! isLoading && experimentAssignment?.variationName === 'treatment'
			}
		/>
	);
};

export default AsyncHelpCenter;
