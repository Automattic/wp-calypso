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
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE );
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setShowHelpCenter, setIsMinimized } = useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		if ( isMinimized ) {
			setIsMinimized( false );
		} else {
			setShowHelpCenter( ! show );
		}
		onClick();
	};

	return (
		<>
			<SidebarMenuItem
				onClick={ handleToggleHelpCenter }
				className={ clsx( 'sidebar__item-help', {
					'is-active': show,
				} ) }
				tooltip={ tooltip }
				tooltipPlacement="top"
				icon={ <HelpIcon ref={ helpIconRef } /> }
			/>
		</>
	);
};

export default SidebarHelpCenter;
