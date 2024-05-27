import classnames from 'classnames';
import { PromptIcon } from 'calypso/components/command-palette/icon';
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
