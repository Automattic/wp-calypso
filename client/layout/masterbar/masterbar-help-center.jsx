import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { HelpIcon, PromotionalPopover } from '@automattic/help-center';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import classnames from 'classnames';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from './item';

const HELP_CENTER_STORE = HelpCenter.register();

const MasterbarHelpCenter = ( { tooltip } ) => {
	const helpIconRef = useRef();
	const sectionName = useSelector( getSectionName );

	const helpCenterVisible = useDateStoreSelect( ( select ) =>
		select( HELP_CENTER_STORE ).isHelpCenterShown()
	);
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		recordTracksEvent( `calypso_inlinehelp_${ helpCenterVisible ? 'close' : 'show' }`, {
			forceSiteId: true,
			location: 'help-center',
			section: sectionName,
		} );

		setShowHelpCenter( ! helpCenterVisible );
	};

	return (
		<>
			<Item
				onClick={ handleToggleHelpCenter }
				className={ classnames( 'masterbar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				icon={ <HelpIcon ref={ helpIconRef } /> }
			/>
			<PromotionalPopover iconElement={ helpIconRef.current } />
		</>
	);
};

export default MasterbarHelpCenter;
