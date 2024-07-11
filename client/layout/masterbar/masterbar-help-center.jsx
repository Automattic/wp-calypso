import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { HelpIcon } from '@automattic/help-center';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { tooltip, onLoad } ) => {
	const helpIconRef = useRef();
	const sectionName = useSelector( getSectionName );

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

	useEffect( () => {
		onLoad();
	}, [ onLoad ] );

	return (
		<>
			<Item
				onClick={ handleToggleHelpCenter }
				className={ clsx( 'masterbar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				icon={ <HelpIcon ref={ helpIconRef } /> }
			/>
		</>
	);
};

export default MasterbarHelpCenter;
