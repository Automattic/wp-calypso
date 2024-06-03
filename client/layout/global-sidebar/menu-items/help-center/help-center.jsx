import { HelpCenter } from '@automattic/data-stores';
import { HelpIcon } from '@automattic/help-center';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import clsx from 'clsx';
import { useRef } from 'react';
import SidebarMenuItem from '../menu-item';

const HELP_CENTER_STORE = HelpCenter.register();

const SidebarHelpCenter = ( { tooltip, onClick } ) => {
	const helpIconRef = useRef();
	const helpCenterVisible = useDateStoreSelect(
		( select ) => select( HELP_CENTER_STORE ).isHelpCenterShown(),
		[]
	);
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		setShowHelpCenter( ! helpCenterVisible );
		onClick();
	};

	return (
		<>
			<SidebarMenuItem
				onClick={ handleToggleHelpCenter }
				className={ clsx( 'sidebar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				tooltipPlacement="top"
				icon={ <HelpIcon ref={ helpIconRef } /> }
			/>
		</>
	);
};

export default SidebarHelpCenter;
