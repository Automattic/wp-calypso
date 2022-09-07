import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useHasSeenWhatsNewModalQuery, HelpCenter } from '@automattic/data-stores';
import { HelpIcon } from '@automattic/help-center';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { siteId, tooltip } ) => {
	const { isLoading, data } = useHasSeenWhatsNewModalQuery( siteId );
	const sectionName = useSelector( getSectionName );

	const newItems = ! isLoading && ! data?.has_seen_whats_new_modal;

	const helpCenterVisible = useDateStoreSelect( ( select ) =>
		select( HELP_CENTER_STORE ).isHelpCenterShown()
	);
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! helpCenterVisible );
	};

	return (
		<Item
			onClick={ handleToggleHelpCenter }
			className={ classnames( 'masterbar__item-help', {
				'is-active': helpCenterVisible,
			} ) }
			tooltip={ tooltip }
			icon={ <HelpIcon newItems={ newItems } /> }
		/>
	);
};

export default MasterbarHelpCenter;
