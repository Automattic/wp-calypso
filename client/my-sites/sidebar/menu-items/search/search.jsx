import classnames from 'classnames';
import { connect } from 'react-redux';
import { useDispatch } from 'calypso/state';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import SidebarMenuItem from '../menu-item';
import { SearchIcon } from './search-icon';

const SidebarSearch = ( { tooltip } ) => {
	const dispatch = useDispatch();
	const showCommandPalette = () => {
		dispatch( openCommandPalette() );
	};
	return (
		<>
			<SidebarMenuItem
				onClick={ showCommandPalette }
				className={ classnames( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				icon={ <SearchIcon /> }
			/>
		</>
	);
};
export default connect( null, { openCommandPalette } )( SidebarSearch );
