import { useBreakpoint } from '@automattic/viewport-react';
import { useRef, useState, useCallback, useMemo } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
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

	// Render the popover content based on the environment
	const renderPopoverContent = useMemo( () => {
		switch ( true ) {
			case isA8CForAgencies():
				return <AddNewSiteMenuItems.A4A setMenuVisible={ setMenuVisible } />;
			default:
				return null;
		}
	}, [ setMenuVisible ] );

	// Render the modals content based on the environment
	const renderModalsContent = useMemo( () => {
		switch ( true ) {
			case isA8CForAgencies():
				return <AddNewSiteModals.A4A />;
			default:
				return null;
		}
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
				{ renderPopoverContent }
			</AddNewSitePopover>
			{ renderModalsContent }
		</AddNewSiteContext.Provider>
	);
};

export default AddNewSite;
