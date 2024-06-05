import { PromptIcon } from '@automattic/command-palette';
import clsx from 'clsx';
import { useDispatch } from 'calypso/state';
import { openCommandPalette } from 'calypso/state/command-palette/actions';
import SidebarMenuItem from '../menu-item';

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
				className={ clsx( 'sidebar__item-search', {
					'is-active': false,
				} ) }
				tooltip={ tooltip }
				tooltipPlacement="top"
				icon={ <PromptIcon /> }
			/>
		</>
	);
};
