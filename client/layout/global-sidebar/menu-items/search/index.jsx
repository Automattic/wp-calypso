import { Icon, search } from '@wordpress/icons';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import { useDispatch } from 'calypso/state';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import { getShouldShowGlobalSiteSidebar } from 'calypso/state/global-sidebar/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarMenuItem from '../menu-item';

export const SidebarSearch = ( { tooltip, onClick } ) => {
	const dispatch = useDispatch();
	const showCommandPalette = () => {
		dispatch( openCommandPalette() );
		onClick();
	};
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { currentSection } = useCurrentRoute();
	const shouldShowGlobalSiteSidebar = useSelector( ( state ) => {
		return getShouldShowGlobalSiteSidebar(
			state,
			selectedSiteId,
			currentSection?.group,
			currentSection?.name
		);
	} );
	return (
		<>
			<SidebarMenuItem
				onClick={ showCommandPalette }
				className={ classnames( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				icon={ <Icon icon={ search } size={ 28 } /> }
				tooltipPlacement={ shouldShowGlobalSiteSidebar ? 'bottom-left' : 'bottom' }
			/>
		</>
	);
};
