//import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import classnames from 'classnames';
//import { useRef } from 'react';
//import { useSelector } from 'react-redux';
//import { getSectionName } from 'calypso/state/ui/selectors';
import SidebarMenuItem from '../menu-item';
import { HelpIcon } from './help-icon';

const HELP_CENTER_STORE = HelpCenter.register();

const SidebarHelpCenter = ( { tooltip } ) => {
	//const helpIconRef = useRef();
	//const sectionName = useSelector( getSectionName );

	const helpCenterVisible = useDateStoreSelect( ( select ) =>
		select( HELP_CENTER_STORE ).isHelpCenterShown()
	);
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		// TODO: track this event when sidebar dev is ready
		// recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
		// 	force_site_id: true,
		// 	location: 'help-center',
		// 	section: sectionName,
		// } );

		setShowHelpCenter( ! helpCenterVisible );
	};

	return (
		<>
			<SidebarMenuItem
				onClick={ handleToggleHelpCenter }
				className={ classnames( 'sidebar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				icon={ <HelpIcon /> }
			/>
		</>
	);
};

export default SidebarHelpCenter;
