import { HelpCenter } from '@automattic/data-stores';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDateStoreSelect,
} from '@wordpress/data';
import { Icon, help } from '@wordpress/icons';
import classnames from 'classnames';
import SidebarMenuItem from '../menu-item';

const HELP_CENTER_STORE = HelpCenter.register();

const SidebarHelpCenter = ( { tooltip, tooltipPlacement, onClick } ) => {
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
				className={ classnames( 'sidebar__item-help', {
					'is-active': helpCenterVisible,
				} ) }
				tooltip={ tooltip }
				tooltipPlacement={ tooltipPlacement }
				icon={ <Icon icon={ help } size={ 28 } /> }
			/>
		</>
	);
};

export default SidebarHelpCenter;
