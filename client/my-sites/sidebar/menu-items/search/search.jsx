import classnames from 'classnames';
import SidebarMenuItem from '../menu-item';
import { SearchIcon } from './search-icon';

const SidebarSearch = ( { tooltip } ) => {
	const handleToggleSearch = () => {
		console.debug( 'command k' );
	};

	return (
		<>
			<SidebarMenuItem
				onClick={ handleToggleSearch }
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
