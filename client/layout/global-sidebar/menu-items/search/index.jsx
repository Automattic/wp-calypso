import classnames from 'classnames';
import { useDispatch } from 'calypso/state';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import SidebarMenuItem from '../menu-item';
import { PromptIcon } from './icon';

export const SidebarSearch = ( { tooltip, onClick } ) => {
	const dispatch = useDispatch();
	const showCommandPalette = () => {
		dispatch( openCommandPalette() );
		onClick();
	};
	return (
		<>
			<SidebarMenuItem
				onClick={ showCommandPalette }
				className={ classnames( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				tooltipPlacement="top"
				icon={ <PromptIcon /> }
			/>
		</>
	);
};
