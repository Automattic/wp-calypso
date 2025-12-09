import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

export default function useHelpCenter() {
	const { show, isMinimized } = useDateStoreSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			show: store.isHelpCenterShown(),
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const { setShowHelpCenter, setIsMinimized, setNavigateToRoute } =
		useDataStoreDispatch( HELP_CENTER_STORE );

	const handleToggleHelpCenter = () => {
		if ( isMinimized ) {
			setIsMinimized( false );
		} else {
			setShowHelpCenter( ! show );
		}
	};

	return {
		toggleHelpCenter: handleToggleHelpCenter,
		setNavigateToRoute,
		show,
		isMinimized,
	};
}
