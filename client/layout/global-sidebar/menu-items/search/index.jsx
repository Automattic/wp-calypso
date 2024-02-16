import classnames from 'classnames';
import SidebarMenuItem from '../menu-item';
import { SearchIcon } from './icon';

const SidebarSearch = ( { tooltip } ) => {
	return (
		<>
			<SidebarMenuItem
				onClick={ () => {} }
				className={ classnames( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				icon={ <SearchIcon /> }
			/>
		</>
	);
};
export default SidebarSearch;
