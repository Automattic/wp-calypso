import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import AsyncLoad from 'calypso/components/async-load';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter = () => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);

	const handleClose = () => setShowHelpCenter( false );

	if ( ! isShowingHelpCenter ) {
		return null;
	}

	return (
		<AsyncLoad require="@automattic/help-center" placeholder={ null } handleClose={ handleClose } />
	);
};

export default AsyncHelpCenter;
