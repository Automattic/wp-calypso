import { NavigatorButtonAsItem } from '../../navigator-buttons';
import NavigatorItemGroup from '../../navigator-item-group';
import type { NavigatorScreenObject } from '../types';

const useNavigatorButtons = ( screens: NavigatorScreenObject[] ) => {
	if ( screens.length === 0 ) {
		return null;
	}

	if ( screens.length === 1 ) {
		return screens[ 0 ].content;
	}

	return (
		<NavigatorItemGroup>
			{ screens.map( ( { slug, checked, icon, label, path, onSelect } ) => (
				<NavigatorButtonAsItem
					key={ path }
					checked={ checked }
					icon={ icon }
					path={ path }
					aria-label={ label }
					onClick={ () => onSelect?.( slug ) }
				>
					{ label }
				</NavigatorButtonAsItem>
			) ) }
		</NavigatorItemGroup>
	);
};

export default useNavigatorButtons;
