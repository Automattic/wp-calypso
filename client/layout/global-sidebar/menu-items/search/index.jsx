import { Icon, search } from '@wordpress/icons';
import classnames from 'classnames';
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
				icon={ <Icon
					icon={ search }
					size={ 28 }
				/> }
			/>
		</>
	);
};
export default SidebarSearch;
