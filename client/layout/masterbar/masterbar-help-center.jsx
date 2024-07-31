import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { helpFilled } from '@wordpress/icons';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { tooltip } ) => {
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
