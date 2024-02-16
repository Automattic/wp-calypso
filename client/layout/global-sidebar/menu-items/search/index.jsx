import classnames from 'classnames';
import SidebarCustomIcon from 'calypso/layout/sidebar/custom-icon';
import SidebarMenuItem from '../menu-item';

const SidebarSearch = ( { tooltip } ) => {
	return (
		<>
			<SidebarMenuItem
				onClick={ () => {} }
				className={ classnames( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				icon={ <SidebarCustomIcon icon="dashicon-search" /> }
			/>
		</>
	);
};
export default SidebarSearch;
