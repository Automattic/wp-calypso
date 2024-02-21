import { Icon, search } from '@wordpress/icons';
import classnames from 'classnames';
import { useDispatch } from 'calypso/state';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import SidebarMenuItem from '../menu-item';

export const SidebarSearch = ( { tooltip } ) => {
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
				icon={ <Icon icon={ search } size={ 28 } /> }
			/>
		</>
	);
};
