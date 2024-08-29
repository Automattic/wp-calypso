import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { usePrevious } from '@wordpress/compose';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { helpFilled } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { tooltip } ) => {
	const sectionName = useSelector( getSectionName );
	const isNotificationsOpen = useSelector( ( state ) => getIsNotificationsOpen( state ) );
	const prevIsNotificationsOpen = usePrevious( isNotificationsOpen );

	const helpCenterVisible = useDateStoreSelect( ( select ) =>
		select( HELP_CENTER_STORE ).isHelpCenterShown()
	);
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! helpCenterVisible );
	};

	// Close the help center when notifications are opened
	useEffect( () => {
		if ( ! prevIsNotificationsOpen && isNotificationsOpen && helpCenterVisible ) {
			setShowHelpCenter( false );
		}
	}, [ helpCenterVisible, isNotificationsOpen, prevIsNotificationsOpen, setShowHelpCenter ] );

	return (
		<>
			<Item
				onClick={ handleToggleHelpCenter }
				className={ clsx( 'masterbar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				icon={ helpFilled }
			/>
		</>
	);
};

export default MasterbarHelpCenter;
