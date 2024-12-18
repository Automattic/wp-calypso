import { useBreakpoint } from '@automattic/viewport-react';
import { useRef, useState, useCallback } from 'react';
import AddNewSiteButton from './button';
import { AddNewSiteContext } from './context';
import AddNewSiteMenuItems from './menu-items';
import AddNewSiteModals from './modals';
import AddNewSitePopover from './popover';

import './style.scss';

const AddNewSite = () => {
	const isNarrowView = useBreakpoint( '<660px' );

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ visibleModalType, setVisibleModalType ] = useState( '' );

	const popoverMenuContext = useRef( null );

	const toggleMenu = useCallback( () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	}, [] );

	return (
		<AddNewSiteContext.Provider value={ { visibleModalType, setVisibleModalType } }>
			<AddNewSiteButton
				showMainButtonLabel={ ! isNarrowView }
				isMenuVisible={ isMenuVisible }
				toggleMenu={ toggleMenu }
				popoverMenuContext={ popoverMenuContext }
			/>
			<AddNewSitePopover
				isMenuVisible={ isMenuVisible }
				toggleMenu={ toggleMenu }
				popoverMenuContext={ popoverMenuContext }
			>
				<AddNewSiteMenuItems setMenuVisible={ setMenuVisible } />
			</AddNewSitePopover>
			<AddNewSiteModals />
		</AddNewSiteContext.Provider>
	);
};

export default AddNewSite;
